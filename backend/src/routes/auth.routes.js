import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { verifyCredentials } from '../auth/users.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return res.status(400).json({ error: 'missing_credentials' });
    }

    const user = await verifyCredentials(username, password);
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    const token = jwt.sign({ sub: user.userId, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '12h',
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;
