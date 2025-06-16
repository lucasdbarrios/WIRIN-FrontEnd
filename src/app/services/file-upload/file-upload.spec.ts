import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { FileUploadService } from './file-upload.service';
import { EnvService } from '../env/env.service';
import { AuthService } from '../auth/auth.service';
import { HttpEventType } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('FileUploadService', () => {
    let service: FileUploadService;
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
            FileUploadService,
            { provide: EnvService, useValue: envSpy },
            { provide: AuthService, useValue: authSpy },
            provideHttpClient(),
            provideHttpClientTesting(),
            provideRouter([])
        ]
        });

        service = TestBed.inject(FileUploadService);
        httpMock = TestBed.inject(HttpTestingController);
        envService = TestBed.inject(EnvService) as jasmine.SpyObj<EnvService>;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debería subir un archivo correctamente', (done) => {
        const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
        const formData = new FormData();
        formData.append('file', mockFile);

        service.uploadFile(mockFile).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
            expect(event.loaded).toBeGreaterThan(0);
        } else if (event.type === HttpEventType.Response) {
            expect(event.body).toEqual({ success: true });
            done();
        }
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/upload`);
        expect(req.request.method).toBe('POST');
        req.flush({ success: true }, { status: 200, statusText: 'OK' });
    });

    it('debería procesar OCR correctamente', (done) => {
        const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
        const mockResponse = { textExtracted: 'Texto extraído del documento' };

        service.processOcr(mockFile, 'Local').subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/ocr/Local`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('debería procesar OCR por ID de archivo', (done) => {
        const mockResponse = { textExtracted: 'Texto procesado por ID' };

        service.newProcessOcr(1, 'Local').subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
        });

        const req = httpMock.expectOne(`${envService.getApiUrl()}/ocr/Local?id=1`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('debería validar el tipo de archivo correctamente', () => {
        const pdfFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
        const wordFile = new File(['contenido'], 'test.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const invalidFile = new File(['contenido'], 'test.png', { type: 'image/png' });

        expect(service.isValidFileType(pdfFile)).toBeTrue();
        expect(service.isValidFileType(wordFile)).toBeTrue();
        expect(service.isValidFileType(invalidFile)).toBeFalse();
    });
});