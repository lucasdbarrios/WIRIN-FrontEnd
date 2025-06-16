import { TestBed } from '@angular/core/testing';
import { ParagraphAnnotationService } from './paragraphAnnotation.service';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../env/env.service';
import { of } from 'rxjs';
import { Annotation } from '../../types/annotation.interface';

describe('ParagraphAnnotationService', () => {
  let service: ParagraphAnnotationService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let envSpy: jasmine.SpyObj<EnvService>;

  const mockAnnotation: Annotation = {
    annotationText: 'Error de ortografía',
    paragraphId: 123,
    userId: 'user-001',
    orderId: 456,
    // opcionales:
    id: 1,
    creationDate: new Date()
  };

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    envSpy = jasmine.createSpyObj('EnvService', ['getApiUrl']);

    envSpy.getApiUrl.and.returnValue('http://fake-api.com/api');

    TestBed.configureTestingModule({
      providers: [
        ParagraphAnnotationService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: EnvService, useValue: envSpy }
      ]
    });

    service = TestBed.inject(ParagraphAnnotationService);
    localStorage.setItem('auth_token', 'test-token');
  });

  it('should call HttpClient.post with correct URL, body and headers', () => {
    httpSpy.post.and.returnValue(of('ok'));

    service.saveErrorMessageParagraph(mockAnnotation).subscribe((result: string) => {
        expect(result).toBe('ok');
      });

    expect(httpSpy.post).toHaveBeenCalledWith(
      'http://fake-api.com/api/ParagraphAnnotation',
      { paragraphAnnotation: mockAnnotation },
      jasmine.objectContaining({
        headers: jasmine.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        }),
        responseType: 'text'
      })
    );
  });
});