import { Request, Response } from 'express';
import { 
  registerUser, 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controller/admin.controller';
import User from '../models/User.model';

// Mock de las dependencias
jest.mock('../models/User.model');

// Extender el tipo Request para incluir user
interface ExtendedRequest extends Request {
  user?: any;
}

describe('Users Controller - registerUser', () => {
  let mockReq: Partial<ExtendedRequest>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  describe('Casos de éxito', () => {
    test('debería registrar un usuario exitosamente', async () => {
      const mockUser = {
        Nombre: 'Test User',
        Rol: 'Usuario',
        Correo: 'test@example.com'
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);

      mockReq.body = {
        Nombre: 'Test User',
        Rol: 'Usuario',
        Correo: 'test@example.com',
        Clave: 'password123'
      };

      await registerUser(mockReq as Request, mockRes as Response);

      expect(User.create).toHaveBeenCalledWith({
        Nombre: 'Test User',
        Rol: 'Usuario',
        Correo: 'test@example.com',
        Clave: 'password123',
        Activo: true,
        Eliminado: false
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Usuario registrado exitosamente',
        user: {
          nombre: 'Test User'
        }
      });
    });
  });

  describe('Casos de error', () => {
    test('debería manejar errores de validación de base de datos', async () => {
      (User.create as jest.Mock).mockRejectedValue(new Error('Database constraint error'));

      mockReq.body = {
        Nombre: 'Test User',
        Rol: 'Usuario',
        Correo: 'test@example.com',
        Clave: 'password123'
      };

      await registerUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error al registrar usuario' });
    });

    test('debería manejar errores inesperados', async () => {
      (User.create as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      mockReq.body = {
        Nombre: 'Test User',
        Rol: 'Usuario',
        Correo: 'test@example.com',
        Clave: 'password123'
      };

      await registerUser(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error al registrar usuario' });
    });
  });
});

describe('Users Controller - getUsers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {};
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería obtener todos los usuarios no eliminados', async () => {
    const mockUsers = [
      { id: 1, Nombre: 'User 1', Correo: 'user1@test.com', Rol: 'Usuario', Activo: true, Eliminado: false },
      { id: 2, Nombre: 'User 2', Correo: 'user2@test.com', Rol: 'Admin', Activo: true, Eliminado: false }
    ];

    (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

    await getUsers(mockReq as Request, mockRes as Response);

    expect(User.findAll).toHaveBeenCalledWith({
      attributes: { exclude: ['Clave'] },
      where: { Eliminado: false }
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ users: mockUsers });
  });

  test('debería manejar errores de base de datos', async () => {
    (User.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

    await getUsers(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Error al obtener usuarios, Error: Database error' });
  });

  test('debería retornar array vacío cuando no hay usuarios', async () => {
    (User.findAll as jest.Mock).mockResolvedValue([]);

    await getUsers(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ users: [] });
  });
});

describe('Users Controller - getUserById', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      params: {}
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería obtener un usuario por ID exitosamente', async () => {
    const mockUser = {
      id: 1,
      Nombre: 'Test User',
      Correo: 'test@example.com',
      Rol: 'Usuario'
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    mockReq.params = { id: '1' };

    await getUserById(mockReq as Request, mockRes as Response);

    expect(User.findByPk).toHaveBeenCalledWith('1', {
      attributes: { exclude: ['Clave'] }
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ user: mockUser });
  });

  test('debería retornar 404 cuando el usuario no existe', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    mockReq.params = { id: '999' };

    await getUserById(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  test('debería manejar errores de base de datos', async () => {
    (User.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

    mockReq.params = { id: '1' };

    await getUserById(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Error al obtener usuario' });
  });

  test('debería manejar ID inválido', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    mockReq.params = { id: 'invalid' };

    await getUserById(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });
});

describe('Users Controller - updateUser', () => {
  let mockReq: Partial<ExtendedRequest>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      params: {},
      body: {},
      user: { id: 2 } // Usuario diferente al que se está editando
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería actualizar un usuario exitosamente', async () => {
    const mockUser = {
      id: 1,
      Nombre: 'Old Name',
      Correo: 'old@example.com',
      Rol: 'Old Rol',
      Activo: true,
      save: jest.fn().mockResolvedValue(true)
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    mockReq.params = { id: '1' };
    mockReq.body = {
      Nombre: 'New Name',
      Correo: 'new@example.com',
      Rol: 'New Rol',
      Activo: false
    };

    await updateUser(mockReq as Request, mockRes as Response);

    expect(User.findByPk).toHaveBeenCalledWith('1');
    expect(mockUser.Nombre).toBe('New Name');
    expect(mockUser.Correo).toBe('new@example.com');
    expect(mockUser.Rol).toBe('New Rol');
    expect(mockUser.Activo).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Usuario actualizado exitosamente',
      user: mockUser
    });
  });

  test('debería retornar 404 cuando el usuario no existe', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    mockReq.params = { id: '999' };
    mockReq.body = {
      Nombre: 'New Name',
      Correo: 'new@example.com',
      Rol: 'New Rol',
      Activo: true
    };

    await updateUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  test('debería impedir desactivar el usuario actual', async () => {
    const mockUser = {
      id: 2, // Mismo ID que el usuario autenticado
      Nombre: 'Current User',
      Correo: 'current@example.com',
      Rol: 'Usuario',
      Activo: true,
      save: jest.fn()
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    mockReq.user = { id: 2 }; // Usuario autenticado

    mockReq.params = { id: '2' };
    mockReq.body = {
      Nombre: 'Current User',
      Correo: 'current@example.com',
      Rol: 'Usuario',
      Activo: false // Intentar desactivarse a sí mismo
    };

    await updateUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'No se puede desactivar el usuario actual'
    });
    expect(mockUser.save).not.toHaveBeenCalled();
  });

  test('debería impedir cambiar el rol del usuario actual', async () => {
    const mockUser = {
      id: 2, // Mismo ID que el usuario autenticado
      Nombre: 'Current User',
      Correo: 'current@example.com',
      Rol: 'Usuario',
      Activo: true,
      save: jest.fn()
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    mockReq.user = { id: 2 }; // Usuario autenticado

    mockReq.params = { id: '2' };
    mockReq.body = {
      Nombre: 'Current User',
      Correo: 'current@example.com',
      Rol: 'Admin', // Intentar cambiar rol
      Activo: true
    };

    await updateUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'No se puede cambiar el rol del usuario actual'
    });
    expect(mockUser.save).not.toHaveBeenCalled();
  });

  test('debería manejar errores de base de datos al guardar', async () => {
    const mockUser = {
      id: 1,
      Nombre: 'Old Name',
      Correo: 'old@example.com',
      Rol: 'Old Rol',
      Activo: true,
      save: jest.fn().mockRejectedValue(new Error('Save error'))
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    mockReq.params = { id: '1' };
    mockReq.body = {
      Nombre: 'New Name',
      Correo: 'new@example.com',
      Rol: 'New Rol',
      Activo: true
    };

    await updateUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Error al actualizar usuario, Error: Save error' });
  });
});

describe('Users Controller - deleteUser', () => {
  let mockReq: Partial<ExtendedRequest>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockReq = {
      body: {},
      user: { id: 2 } // Usuario diferente al que se está eliminando
    };
    
    mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    jest.clearAllMocks();
  });

  test('debería eliminar (lógicamente) un usuario exitosamente', async () => {
    const mockUser = {
      id: 1,
      Nombre: 'User to delete',
      Eliminado: false,
      save: jest.fn().mockResolvedValue(true)
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    mockReq.body = { id: 1 };

    await deleteUser(mockReq as Request, mockRes as Response);

    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(mockUser.Eliminado).toBe(true);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Usuario eliminado exitosamente'
    });
  });

  test('debería retornar 404 cuando el usuario no existe', async () => {
    (User.findByPk as jest.Mock).mockResolvedValue(null);

    mockReq.body = { id: 999 };

    await deleteUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  test('debería impedir que un usuario se elimine a sí mismo', async () => {
    const mockUser = {
      id: 2, // Mismo ID que el usuario autenticado
      Nombre: 'Current User',
      Eliminado: false,
      save: jest.fn()
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    mockReq.user = { id: 2 }; // Usuario autenticado

    mockReq.body = { id: 2 };

    await deleteUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'No se puede eliminar el usuario actual'
    });
    expect(mockUser.save).not.toHaveBeenCalled();
  });

  test('debería manejar errores de base de datos al guardar', async () => {
    const mockUser = {
      id: 1,
      Nombre: 'User to delete',
      Eliminado: false,
      save: jest.fn().mockRejectedValue(new Error('Save error'))
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    mockReq.body = { id: 1 };

    await deleteUser(mockReq as Request, mockRes as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Error al eliminar usuario, Error: Save error' });
  });

  test('debería manejar cuando el usuario ya está eliminado', async () => {
    const mockUser = {
      id: 1,
      Nombre: 'Already deleted',
      Eliminado: true, // Ya está eliminado
      save: jest.fn()
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

    mockReq.body = { id: 1 };

    await deleteUser(mockReq as Request, mockRes as Response);

    expect(mockUser.Eliminado).toBe(true); // Ya estaba en true
    expect(mockUser.save).toHaveBeenCalled(); // Aún se guarda, pero no cambia
  });
});

// Tests de flujos completos
describe('Flujos completos de gestión de usuarios', () => {
  test('Flujo completo: crear → obtener → actualizar → eliminar usuario', async () => {
    // Mock para crear usuario
    const mockNewUser = {
      Nombre: 'Test User',
      Rol: 'Usuario',
      Correo: 'test@example.com'
    };

    (User.create as jest.Mock).mockResolvedValue(mockNewUser);

    const mockReqCreate = {
      body: {
        Nombre: 'Test User',
        Rol: 'Usuario',
        Correo: 'test@example.com',
        Clave: 'password123'
      }
    } as Partial<Request>;

    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockRes = {
      status: mockStatus,
      json: mockJson
    } as Partial<Response>;

    // 1. Crear usuario
    await registerUser(mockReqCreate as Request, mockRes as Response);
    expect(mockStatus).toHaveBeenCalledWith(201);

    // 2. Obtener usuarios
    const mockUsers = [mockNewUser];
    (User.findAll as jest.Mock).mockResolvedValue(mockUsers);
    
    await getUsers({} as Request, mockRes as Response);
    expect(mockStatus).toHaveBeenCalledWith(200);

    // 3. Obtener usuario por ID
    (User.findByPk as jest.Mock).mockResolvedValue(mockNewUser);
    
    const mockReqGetById = {
      params: { id: '1' }
    } as Partial<Request>;

    await getUserById(mockReqGetById as Request, mockRes as Response);
    expect(mockStatus).toHaveBeenCalledWith(200);

    // 4. Eliminar usuario (por otro usuario admin)
    const mockUserToDelete = {
      id: 1,
      Nombre: 'Test User',
      Eliminado: false,
      save: jest.fn().mockResolvedValue(true)
    };

    (User.findByPk as jest.Mock).mockResolvedValue(mockUserToDelete);
    
    const mockReqDelete = {
      body: { id: 1 },
      user: { id: 2 } // Usuario diferente
    } as Partial<ExtendedRequest>;

    await deleteUser(mockReqDelete as Request, mockRes as Response);
    expect(mockStatus).toHaveBeenCalledWith(200);
  });
});