import { TestBed } from '@angular/core/testing';
import { MessageService, MessageFolder } from './message.service';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { of } from 'rxjs';
import { Message } from '../../types/message.interface';

describe('MessageService', () => {
    let service: MessageService;
    let httpSpy: jasmine.SpyObj<HttpClient>;
    let authSpy: jasmine.SpyObj<AuthService>;
    const apiUrl = 'https://api.test.com/message';
    const headersMock = { headers: { Authorization: 'Bearer token' } };

    beforeEach(() => {
        httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put']);
        authSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);
        authSpy.getHeaders.and.returnValue(headersMock);

        TestBed.configureTestingModule({
        providers: [
            MessageService,
            { provide: HttpClient, useValue: httpSpy },
            { provide: AuthService, useValue: authSpy }
        ]
        });

        service = TestBed.inject(MessageService);
        // @ts-ignore: acceso directo para setear apiUrl de test
        service.apiUrl = apiUrl;
    });

    it('debería obtener los mensajes por carpeta (inbox)', () => {
        httpSpy.get.and.returnValue(of([]));
        service.getMessagesByFolder(MessageFolder.INBOX).subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(`${apiUrl}/recived`, headersMock);
    });

    it('debería obtener todos los mensajes (ALL)', () => {
        httpSpy.get.and.returnValue(of([]));
        service.getMessages().subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(apiUrl, headersMock);
    });

    it('debería obtener los mensajes recibidos (INBOX)', () => {
        httpSpy.get.and.returnValue(of([]));
        service.getReceivedMessages().subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(`${apiUrl}/recived`, headersMock);
    });

    it('debería obtener los mensajes enviados (SENT)', () => {
        httpSpy.get.and.returnValue(of([]));
        service.getSentMessages().subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(`${apiUrl}/sended`, headersMock);
    });

    it('debería obtener mensajes por ID de usuario (método legado)', () => {
        httpSpy.get.and.returnValue(of([]));
        service.getMessagesByUserId('user1').subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(`${apiUrl}/byUserId/user1`);
    });

    it('debería obtener mensaje por ID', () => {
        httpSpy.get.and.returnValue(of({ id: 1 }));
        service.getMessageById(1).subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(`${apiUrl}/byId/1`);
    });

    it('debería enviar un nuevo mensaje', () => {
        httpSpy.post.and.returnValue(of('ok'));

        const partialMessage: Partial<Message> = {
        userFromId: 'user1',
        userToId: 'user2',
        subject: 'Hola',
        content: '¿Cómo estás?'
        };

        service.sendMessage(partialMessage).subscribe();

        expect(httpSpy.post).toHaveBeenCalledWith(
        apiUrl,
        jasmine.any(Object),
        jasmine.objectContaining({ responseType: 'text' })
        );
    });

    it('debería descargar archivo de un mensaje', () => {
        httpSpy.get.and.returnValue(of(new Blob()));
        service.downloadFile(15).subscribe();

        expect(httpSpy.get).toHaveBeenCalledWith(`${apiUrl}/getFile/15`, jasmine.anything());
    });

    it('debería actualizar un mensaje existente', () => {
        httpSpy.put.and.returnValue(of('ok'));

        const mensaje: Partial<Message> = {
        id: 10,
        subject: 'Actualizado',
        userFromId: 'admin',
        userToId: 'alumno',
        content: 'Nuevo contenido'
        };

        service.updateMessage(mensaje).subscribe();

        expect(httpSpy.put).toHaveBeenCalledWith(
        apiUrl,
        jasmine.any(Object),
        headersMock
        );
    });
});