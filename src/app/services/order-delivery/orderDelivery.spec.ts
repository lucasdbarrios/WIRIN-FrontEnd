import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrderDeliveryService } from './orderDelivery.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { OrderSequence } from '../../types/orderSequence.type';
import { OrderDelivery } from '../../types/orderDelivery.type';
import { provideRouter } from '@angular/router';

describe('OrderDeliveryService', () => {
    let service: OrderDeliveryService;
    let httpMock: HttpTestingController;
    let envService: jasmine.SpyObj<EnvService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        const envSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);
        envSpy.getApiUrl.and.returnValue('https://api.test.com');

        const authSpy = jasmine.createSpyObj('AuthService', ['getHeaders']);
        authSpy.getHeaders.and.returnValue({ headers: { 'Authorization': 'Bearer testToken' } });

        TestBed.configureTestingModule({
        providers: [
            OrderDeliveryService,
            { provide: EnvService, useValue: envSpy },
            { provide: AuthService, useValue: authSpy },
            provideHttpClient(),
            provideHttpClientTesting(),
            provideRouter([])
        ]
        });

        service = TestBed.inject(OrderDeliveryService);
        httpMock = TestBed.inject(HttpTestingController);
        envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería procesar la entrega de una orden', (done) => {
        const mockOrderSequence: OrderSequence[] = [{ orderId: 1, orderDeliveryId: 1, order:1 }];
        const studentId = '12345';
        const mockResponse = { success: true };

        service.processDelivery(mockOrderSequence, studentId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/orderdelivery/performDelivery`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ SelectedOrders: mockOrderSequence, StudentId: studentId });
        req.flush(mockResponse);
    });

    it('debería crear una nueva entrega', (done) => {
        const mockDeliveryData: OrderDelivery = {
        studentId: '12345',
        title: 'Entrega de materiales',
        deliveryDate: new Date(),
        status: 'pendiente',
        orderQuantity: 2,
        user: { 
            id: '1', 
            userName: 'Test User', 
            email: 'test@example.com', 
            fullName: 'Usuario de prueba', 
            phoneNumber: '123456789', 
            password: '', 
            roles: ['admin'] 
        },
        orders: [
            { 
            id: 1, 
            name: 'Libro A',  // Cambié 'title' por 'name' según la interfaz Order
            subject: 'Matemáticas', 
            description: 'Álgebra avanzada', 
            authorName: 'Autor 1', 
            rangePage: '1-50', 
            isPriority: true, 
            status: 'pendiente', 
            creationDate: '2024-05-01', 
            limitDate: '2024-06-01', 
            createdByUserId: '1', 
            filePath: '/path/to/file.pdf'
            }, 
            { 
            id: 2, 
            name: 'Libro B', 
            subject: 'Historia', 
            description: 'Historia del siglo XX', 
            authorName: 'Autor 2', 
            rangePage: '51-100', 
            isPriority: false, 
            status: 'entregado', 
            creationDate: '2024-05-02', 
            limitDate: '2024-06-02', 
            createdByUserId: '2', 
            filePath: '/path/to/file2.pdf'
            }
        ]
        };
        
        const mockResponse = { success: true };
    
        service.createDelivery(mockDeliveryData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
        });
    
        const req = httpMock.expectOne(`${envService.getApiUrl()}/orderdelivery/create`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockDeliveryData);
        req.flush(mockResponse);
    });

    it('debería obtener todas las entregas', (done) => {
        const mockResponse = [{ orderId: 1, delivered: true }, { orderId: 2, delivered: false }];

        service.getDeliveries().subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/orderdelivery`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('debería obtener entregas de órdenes con detalles', (done) => {
        const mockResponse = [{ orderId: 1, delivered: true, details: 'Entregado correctamente' }];

        service.getOrderDeliveriesWithOrders().subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/orderdelivery/WithOrders`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('debería eliminar una entrega por ID', (done) => {
        const deliveryId = 42;
        const mockResponse = { message: 'Eliminado correctamente' };

        service.deleteOrderDelivery(deliveryId).subscribe(response => {
            expect(response).toEqual(mockResponse);
            done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/orderdelivery/${deliveryId}`);
        expect(req.request.method).toBe('DELETE');
        expect(req.request.headers.get('Authorization')).toBe('Bearer testToken');
        req.flush(mockResponse);
    });

    it('debería actualizar una entrega existente', (done) => {
        const deliveryId = 99;
        const formData = new FormData();
        formData.append('Title', 'Bibliografía actualizada');
        formData.append('StudentId', 'student999');
        formData.append('Status', 'Revisado');

        const mockResponse = { success: true };

        service.updateOrderDelivery(deliveryId, formData).subscribe(response => {
            expect(response).toEqual(mockResponse);
            done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/orderdelivery/${deliveryId}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body instanceof FormData).toBeTrue();
        req.flush(mockResponse);
    });
});