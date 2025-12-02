import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginUser, logoutUser, verifyAuth, verifyRol } from '../controller/auth.controller';
import User from '../models/User.model';

// Mock de las dependencias
jest.mock('../models/User.model');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mockSessionId123')
  })
}));
jest.mock('../utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock.jwt.token')
}));

// Extender el tipo Request para incluir user
interface ExtendedRequest extends Request {
  user?: any;
}

// Obtener referencia al mock después de crearlo
const mockGenerateToken = require('../utils/jwt').generateToken;

describe('Auth Controller - loginUser', () => {
  let mockReq: Partial<ExtendedRequest>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockCookie: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockCookie = jest.fn();
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
      cookie: mockCookie
    } as Partial<Response>;

    jest.clearAllMocks();
    // Resetear los mocks
    require('crypto').randomBytes.mockReturnValue({
      toString: jest.fn().mockReturnValue('mockSessionId123')
    });
    mockGenerateToken.mockReturnValue('mock.jwt.token');
  });

  describe('Casos de éxito', () => {
    test('debería hacer login exitoso y retornar token', async () => {
      const mockUser = {
        id: 1,
        Nombre: 'testuser',
        Activo: true,
        Eliminado: false,
        IdSesion: null,
        validatePassword: jest.fn().mockResolvedValue(true),
        update: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      mockGenerateToken.mockReturnValue('valid.jwt.token');

      mockReq.body = { Nombre: 'testuser', Clave: 'password123' };

      await loginUser(mockReq as Request, mockRes as Response);

      expect(User.findOne).toHaveBeenCalledWith({ where: { Nombre: 'testuser' } });
      expect(mockUser.validatePassword).toHaveBeenCalledWith('password123');
      expect(mockUser.update).toHaveBeenCalledWith({ IdSesion: 'mockSessionId123' });
      expect(mockCookie).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Login exitoso',
        user: { id: 1 }
      });
    });
  });

  describe('Casos de error', () => {
    test('debería fallar cuando el usuario no existe', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      mockReq.body = { Nombre: 'nonexistent', Clave: 'password123' };

      await loginUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        isAllowed: false,
        error: 'Nombre o contraseña inválidos.'
      });
    });

    test('debería fallar cuando el usuario está inactivo', async () => {
      const mockUser = {
        Nombre: 'testuser',
        Activo: false,
        Eliminado: false,
        validatePassword: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      mockReq.body = { Nombre: 'testuser', Clave: 'password123' };

      await loginUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        isAllowed: false,
        error: 'Nombre o contraseña inválidos.'
      });
    });

    test('debería fallar cuando el usuario está eliminado', async () => {
      const mockUser = {
        Nombre: 'testuser',
        Activo: true,
        Eliminado: true,
        validatePassword: jest.fn().mockResolvedValue(true)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      mockReq.body = { Nombre: 'testuser', Clave: 'password123' };

      await loginUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        isAllowed: false,
        error: 'Nombre o contraseña inválidos.'
      });
    });

    test('debería fallar cuando la contraseña es incorrecta', async () => {
      const mockUser = {
        Nombre: 'testuser',
        Activo: true,
        Eliminado: false,
        validatePassword: jest.fn().mockResolvedValue(false)
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      mockReq.body = { Nombre: 'testuser', Clave: 'wrongpassword' };

      await loginUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        isAllowed: false,
        error: 'Nombre o contraseña inválidos.'
      });
    });

    test('debería manejar errores del servidor', async () => {
      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockReq.body = { Nombre: 'testuser', Clave: 'password123' };

      await loginUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error en el servidor' });
    });
  });
});

describe('Auth Controller - logoutUser', () => {
  let mockReq: Partial<ExtendedRequest>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockClearCookie: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockClearCookie = jest.fn();
    
    mockReq = {
      cookies: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson,
      clearCookie: mockClearCookie
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería cerrar sesión exitosamente cuando hay token', () => {
    mockReq.cookies = { AuthToken: 'valid.token' };

    logoutUser(mockReq as Request, mockRes as Response);

    expect(mockClearCookie).toHaveBeenCalledWith('AuthToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ message: 'Sesión cerrada correctamente.' });
  });

  test('debería manejar cuando no hay token', () => {
    mockReq.cookies = {};

    logoutUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ 
      error: 'No autenticado, sesión ya cerrada.' 
    });
  });
});

describe('Auth Controller - verifyAuth', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      cookies: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería retornar true cuando hay token válido', () => {
    mockReq.cookies = { AuthToken: 'valid.token' };

    verifyAuth(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(true);
  });

  test('debería retornar 401 cuando no hay token', () => {
    mockReq.cookies = {};

    verifyAuth(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      isAuth: false,
      error: 'No autenticado. Por favor, inicie sesión.'
    });
  });
});

describe('Auth Controller - verifyRol', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      cookies: {},
      query: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería permitir acceso a Administrador', () => {
    mockReq.cookies = { AuthToken: 'valid.token' };
    mockReq.query = { rol: 'Propiedades' };

    (jwt.verify as jest.Mock).mockReturnValue({
      rol: 'Administrador;OtroRol'
    });

    verifyRol(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(true);
  });

  test('debería permitir acceso cuando tiene el rol requerido', () => {
    mockReq.cookies = { AuthToken: 'valid.token' };
    mockReq.query = { rol: 'Propiedades' };

    (jwt.verify as jest.Mock).mockReturnValue({
      rol: 'Propiedades;OtroRol'
    });

    verifyRol(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(true);
  });

  test('debería denegar acceso cuando no tiene el rol requerido', () => {
    mockReq.cookies = { AuthToken: 'valid.token' };
    mockReq.query = { rol: 'Propiedades' };

    (jwt.verify as jest.Mock).mockReturnValue({
      rol: 'OtroRol;RolDiferente'
    });

    verifyRol(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      isAllowed: false,
      error: 'Acceso denegado: Se requiere el rol \'Propiedades\' para esta sección.'
    });
  });

  test('debería manejar token expirado', () => {
    mockReq.cookies = { AuthToken: 'expired.token' };
    mockReq.query = { rol: 'Propiedades' };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token expired');
    });

    verifyRol(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({
      isAllowed: false,
      error: 'Sesión expirada. Por favor, inicia sesión nuevamente.'
    });
  });
});
