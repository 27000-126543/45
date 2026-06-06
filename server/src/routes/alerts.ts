import { Router, Response } from 'express';
import { alerts } from '../store/index.js';
import { authenticate, canAccessRegion, AuthenticatedRequest } from '../middleware/auth.js';
import { approveAlert, rejectAlert, resolveAlert } from '../services/approval.js';
import type { Alert, AlertStatus } from '../types/index.js';

const router = Router();

router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { status } = req.query as { status?: AlertStatus };

  let filteredAlerts = alerts.filter(a => canAccessRegion(req.user!, a.regionCode));

  if (status) {
    filteredAlerts = filteredAlerts.filter(a => a.status === status);
  }

  filteredAlerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json({ success: true, data: filteredAlerts });
});

router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const alert = alerts.find(a => a.id === id);

  if (!alert) {
    res.status(404).json({ success: false, error: '预警不存在' });
    return;
  }

  if (!canAccessRegion(req.user, alert.regionCode)) {
    res.status(403).json({ success: false, error: '无权限访问该预警' });
    return;
  }

  res.json({ success: true, data: alert });
});

router.post('/:id/approve', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const { comment } = req.body as { comment?: string };

  const alert = alerts.find(a => a.id === id);

  if (!alert) {
    res.status(404).json({ success: false, error: '预警不存在' });
    return;
  }

  if (!canAccessRegion(req.user, alert.regionCode)) {
    res.status(403).json({ success: false, error: '无权限操作该预警' });
    return;
  }

  const result = approveAlert(id, req.user, comment || '');

  if (!result) {
    res.status(400).json({ success: false, error: '审批失败，当前用户无此操作权限或预警状态不允许' });
    return;
  }

  res.json({ success: true, data: result });
});

router.post('/:id/reject', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const { comment } = req.body as { comment?: string };

  const alert = alerts.find(a => a.id === id);

  if (!alert) {
    res.status(404).json({ success: false, error: '预警不存在' });
    return;
  }

  if (!canAccessRegion(req.user, alert.regionCode)) {
    res.status(403).json({ success: false, error: '无权限操作该预警' });
    return;
  }

  const result = rejectAlert(id, req.user, comment || '');

  if (!result) {
    res.status(400).json({ success: false, error: '驳回失败，当前用户无此操作权限或预警状态不允许' });
    return;
  }

  res.json({ success: true, data: result });
});

router.post('/:id/resolve', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const { id } = req.params;
  const { comment } = req.body as { comment?: string };

  const alert = alerts.find(a => a.id === id);

  if (!alert) {
    res.status(404).json({ success: false, error: '预警不存在' });
    return;
  }

  if (!canAccessRegion(req.user, alert.regionCode)) {
    res.status(403).json({ success: false, error: '无权限操作该预警' });
    return;
  }

  const result = resolveAlert(id, req.user, comment || '');

  if (!result) {
    res.status(400).json({ success: false, error: '标记解决失败' });
    return;
  }

  res.json({ success: true, data: result });
});

export default router;
