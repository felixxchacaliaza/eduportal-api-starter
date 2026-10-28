import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { ProfileModel } from '../models/profile.model.js';
import { MenuModel } from '../models/menu.model.js';
import { PersonModel } from '../models/person.model.js';
import { env } from '../config/env.js';

const JWT_SECRET = process.env.JWT_SECRET || 'eduportal-super-secret-jwt-key-2026';

export class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Correo y contraseña requeridos' });
        return;
      }

      const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        return;
      }

      if (!user.enabled) {
        res.status(403).json({ success: false, message: 'Usuario desactivado' });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        return;
      }

      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();

      // Cargar persona y perfil
      const person = await PersonModel.findById(user.person);
      const profile = await ProfileModel.findById(user.profile);

      if (!profile || !profile.enabled) {
        res.status(403).json({ success: false, message: 'Perfil de usuario no disponible' });
        return;
      }

      // Construir árbol de menús dinámico según perfil
      const menuTree = await AuthController.buildMenuTree(profile);

      // Firmar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          profileId: profile.id,
          isSuperAdmin: profile.isSuperAdmin
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          expiresIn: '8h',
          user: {
            id: user.id,
            code: user.code,
            email: user.email,
            person: {
              id: person?.id || '',
              dni: person?.dni || '',
              fullName: person ? `${person.firstName} ${person.lastName}` : ''
            },
            profile: {
              id: profile.id,
              name: profile.name,
              isSuperAdmin: profile.isSuperAdmin
            },
            menuTree
          }
        }
      });
    } catch (err: any) {
      console.error('Error en login:', err);
      res.status(500).json({ success: false, message: 'Error en el servidor', error: err.message });
    }
  }

  /**
   * GET /api/auth/me
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Token no proporcionado' });
        return;
      }

      const token = authHeader.split(' ')[1];
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        res.status(401).json({ success: false, message: 'Token inválido o expirado' });
        return;
      }

      const user = await UserModel.findById(decoded.id);
      if (!user || !user.enabled) {
        res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
        return;
      }

      const person = await PersonModel.findById(user.person);
      const profile = await ProfileModel.findById(user.profile);
      if (!profile || !profile.enabled) {
        res.status(403).json({ success: false, message: 'Perfil no disponible' });
        return;
      }

      const menuTree = await AuthController.buildMenuTree(profile);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          code: user.code,
          email: user.email,
          person: {
            id: person?.id || '',
            dni: person?.dni || '',
            fullName: person ? `${person.firstName} ${person.lastName}` : ''
          },
          profile: {
            id: profile.id,
            name: profile.name,
            isSuperAdmin: profile.isSuperAdmin
          },
          menuTree
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Error en el servidor', error: err.message });
    }
  }

  /**
   * Construye el árbol de menús respetando RBAC o SuperAdmin
   */
  private static async buildMenuTree(profile: any): Promise<any[]> {
    const allMenus = await MenuModel.find({ enabled: true }).sort({ order: 1 });
    const isSuper = profile.isSuperAdmin === true;

    const permMap = new Map<string, string>();
    if (!isSuper && Array.isArray(profile.permissions)) {
      for (const p of profile.permissions) {
        permMap.set(p.menu?.toString(), p.accessLevel);
      }
    }

    const roots = allMenus.filter(m => !m.parent);
    const result: any[] = [];

    for (const root of roots) {
      const rootId = root.id;
      const children = allMenus.filter(m => m.parent?.toString() === rootId);

      if (children.length > 0) {
        const allowedChildren: any[] = [];
        for (const child of children) {
          const childId = child.id;
          if (isSuper || permMap.has(childId)) {
            allowedChildren.push({
              id: child.id,
              key: child.key,
              label: child.label,
              icon: child.icon,
              path: child.path,
              accessLevel: isSuper ? 'FULL' : permMap.get(childId)
            });
          }
        }
        if (allowedChildren.length > 0) {
          result.push({
            id: root.id,
            key: root.key,
            label: root.label,
            icon: root.icon,
            path: root.path,
            accessLevel: 'FULL',
            children: allowedChildren
          });
        }
      } else {
        if (isSuper || permMap.has(rootId)) {
          result.push({
            id: root.id,
            key: root.key,
            label: root.label,
            icon: root.icon,
            path: root.path,
            accessLevel: isSuper ? 'FULL' : permMap.get(rootId),
            children: []
          });
        }
      }
    }

    return result;
  }
}
