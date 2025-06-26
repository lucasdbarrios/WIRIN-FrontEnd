import { TestBed } from '@angular/core/testing';
import { ParagraphAnnotationService } from './paragraphAnnotation.service';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../env/env.service';
import { of } from 'rxjs';
import { Annotation } from '../../types/annotation.interface';

describe('Servicio ParagraphAnnotation', () => {
  let servicio: ParagraphAnnotationService;
  let httpEspia: jasmine.SpyObj<HttpClient>;
  let envEspia: jasmine.SpyObj<EnvService>;

  const anotacionMock: Annotation = {
    annotationText: 'Error de ortografía',
    paragraphId: 123,
    userId: 'user-001',
    orderId: 456,
    id: 1,
    creationDate: new Date()
  };

  beforeEach(() => {
    httpEspia = jasmine.createSpyObj('HttpClient', ['post']);
    envEspia = jasmine.createSpyObj('EnvService', ['getApiUrl']);

    envEspia.getApiUrl.and.returnValue('http://fake-api.com/api');

    TestBed.configureTestingModule({
      providers: [
        ParagraphAnnotationService,
        { provide: HttpClient, useValue: httpEspia },
        { provide: EnvService, useValue: envEspia }
      ]
    });

    servicio = TestBed.inject(ParagraphAnnotationService);
    localStorage.setItem('auth_token', 'test-token');
  });

  it('debería llamar a HttpClient.post con la URL, el cuerpo y los headers correctos', () => {
    httpEspia.post.and.returnValue(of('ok'));

    servicio.saveErrorMessageParagraph(anotacionMock).subscribe((resultado: string) => {
      expect(resultado).toBe('ok');
    });

    expect(httpEspia.post).toHaveBeenCalledWith(
      'http://fake-api.com/api/ParagraphAnnotation',
      { paragraphAnnotation: anotacionMock },
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