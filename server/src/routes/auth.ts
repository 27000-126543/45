import { Router, Response } from 'express';
import { users } from '../store/index.js';
import { generateToken, authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { getUserByUsername } from '../data/users.js';

const router = Router();

router.post('/login', (req: AuthenticatedRequest, res: Response): void => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: '用户名和密码不能为空' });
    return;
  }

  const user = getUserByUsername(username);

  if (!user) {
    res.status(401).json({ success: false, error: '用户名或密码错误' });
    return;
  }

  const expectedPassword = username + '123';
  if (password !== expectedPassword) {
    res.status(401).json({ success: false, error: '用户名或密码错误' });
    return;
  }

  const token = generateToken(user);

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        regionCode: user.regionCode,
        avatar: user.avatar,
      },
    },
  });
});

router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: '未认证' });
    return;
  }

  const user = users.find(u => u.id === req.user!.id);

  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      regionCode: user.regionCode,
      avatar: user.avatar,
    },
  });
});

export default router;
