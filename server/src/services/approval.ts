import {
  alerts,
  broadcast,
} from '../store/index.js';
import type { Alert, User, AlertStatus, ApprovalStep } from '../types/index.js';

const ROLE_LEVEL_MAP: Record<string, 1 | 2 | 3> = {
  city: 1,
  province: 2,
  headquarters: 3,
};

const ROLE_NAME_MAP: Record<string, string> = {
  city: '城市工程师',
  province: '省级主管',
  headquarters: '总部网络部',
};

const ensureApprovalHistory = (alert: Alert): void => {
  if (alert.approvalHistory.length === 0) {
    alert.approvalHistory = [
      { id: `${alert.id}-l1`, alertId: alert.id, level: 1, role: ROLE_NAME_MAP.city, approver: '', status: 'pending' },
      { id: `${alert.id}-l2`, alertId: alert.id, level: 2, role: ROLE_NAME_MAP.province, approver: '', status: 'pending' },
      { id: `${alert.id}-l3`, alertId: alert.id, level: 3, role: ROLE_NAME_MAP.headquarters, approver: '', status: 'pending' },
    ];
  }
};

const notifyAlertUpdate = (alert: Alert, action: string): void => {
  broadcast({
    type: 'alert_updated',
    data: {
      id: alert.id,
      action,
      status: alert.status,
      level: alert.level,
      approvalHistory: alert.approvalHistory,
    },
  });
};

const approveAlert = (alertId: string, user: User, comment: string = ''): Alert | null => {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return null;

  if (alert.status === 'resolved' || alert.status === 'approved') {
    return alert;
  }

  ensureApprovalHistory(alert);

  const userLevel = ROLE_LEVEL_MAP[user.role];
  if (!userLevel) return null;

  let nextStatus: AlertStatus = alert.status;

  if (alert.status === 'pending_ack') {
    if (userLevel === 1) {
      nextStatus = 'acknowledged';
      const step = alert.approvalHistory.find((s) => s.level === 1);
      if (step) {
        step.status = 'approved';
        step.approver = user.name;
        step.comment = comment || '已确认接收预警';
        step.approvedAt = new Date().toISOString();
      }
      alert.assignedEngineer = alert.assignedEngineer || user.name;
    } else {
      return null;
    }
  } else if (alert.status === 'acknowledged') {
    if (userLevel >= 2) {
      if (userLevel === 2) {
        nextStatus = 'reviewing';
        const step = alert.approvalHistory.find((s) => s.level === 2);
        if (step) {
          step.status = 'approved';
          step.approver = user.name;
          step.comment = comment || '省级复核通过';
          step.approvedAt = new Date().toISOString();
        }
      } else if (userLevel === 3) {
        nextStatus = 'reviewing';
        const step2 = alert.approvalHistory.find((s) => s.level === 2);
        const step3 = alert.approvalHistory.find((s) => s.level === 3);
        if (step2 && step2.status === 'pending') {
          step2.status = 'approved';
          step2.approver = user.name;
          step2.comment = comment || '总部代省级复核通过';
          step2.approvedAt = new Date().toISOString();
        }
        if (step3) {
          step3.status = 'approved';
          step3.approver = user.name;
          step3.comment = comment || '总部审批通过，启动优化方案';
          step3.approvedAt = new Date().toISOString();
        }
        nextStatus = 'approved';
      }
    } else {
      return null;
    }
  } else if (alert.status === 'reviewing') {
    if (userLevel === 3) {
      nextStatus = 'approved';
      const step = alert.approvalHistory.find((s) => s.level === 3);
      if (step) {
        step.status = 'approved';
        step.approver = user.name;
        step.comment = comment || '总部批准，启动优化方案';
        step.approvedAt = new Date().toISOString();
      }
    } else {
      return null;
    }
  } else {
    return null;
  }

  alert.status = nextStatus;
  notifyAlertUpdate(alert, 'approve');
  return alert;
};

const rejectAlert = (alertId: string, user: User, comment: string = ''): Alert | null => {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return null;

  if (alert.status === 'resolved' || alert.status === 'approved') {
    return alert;
  }

  ensureApprovalHistory(alert);

  const userLevel = ROLE_LEVEL_MAP[user.role];
  if (!userLevel) return null;

  if (alert.status === 'pending_ack') {
    if (userLevel >= 1) {
      alert.status = 'pending_ack';
      alert.approvalHistory = alert.approvalHistory.map((step) => ({
        ...step,
        status: step.level <= userLevel ? 'rejected' : step.status,
        approver: step.level <= userLevel ? user.name : step.approver,
        comment: step.level <= userLevel ? (comment || '驳回预警') : step.comment,
        approvedAt: step.level <= userLevel ? new Date().toISOString() : step.approvedAt,
      })) as ApprovalStep[];
    } else {
      return null;
    }
  } else if (alert.status === 'acknowledged' || alert.status === 'reviewing') {
    if (userLevel >= 2) {
      alert.status = 'pending_ack';
      alert.approvalHistory = alert.approvalHistory.map((step) => {
        if (step.level <= userLevel) {
          return {
            ...step,
            status: 'rejected' as const,
            approver: user.name,
            comment: comment || '驳回，退回重新确认',
            approvedAt: new Date().toISOString(),
          };
        }
        return step;
      }) as ApprovalStep[];
    } else {
      return null;
    }
  } else {
    return null;
  }

  notifyAlertUpdate(alert, 'reject');
  return alert;
};

const resolveAlert = (alertId: string, user: User, comment: string = ''): Alert | null => {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) return null;

  if (alert.status === 'resolved') {
    return alert;
  }

  ensureApprovalHistory(alert);

  alert.status = 'resolved';
  alert.resolution = comment || '问题已解决';
  alert.resolvedAt = new Date().toISOString();

  notifyAlertUpdate(alert, 'resolve');
  return alert;
};

export {
  approveAlert,
  rejectAlert,
  resolveAlert,
};
