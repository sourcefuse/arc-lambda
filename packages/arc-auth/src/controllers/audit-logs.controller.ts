import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {authenticate, STRATEGY} from 'loopback4-authentication';
import {authorize} from 'loopback4-authorization';
import {AuditLog} from '../models';
import {AuditLogRepository} from '../repositories';

export class AuditLogsController {
  constructor(
    @repository(AuditLogRepository)
    public auditLogRepository: AuditLogRepository,
  ) {}

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @post('/audit-logs')
  @response(200, {
    description: 'AuditLog model instance',
    content: {'application/json': {schema: getModelSchemaRef(AuditLog)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuditLog, {
            title: 'NewAuditLog',
            exclude: ['id'],
          }),
        },
      },
    })
    auditLog: Omit<AuditLog, 'id'>,
  ): Promise<AuditLog> {
    return this.auditLogRepository.create(auditLog);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @get('/audit-logs/count')
  @response(200, {
    description: 'AuditLog model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(AuditLog) where?: Where<AuditLog>): Promise<Count> {
    return this.auditLogRepository.count(where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @get('/audit-logs')
  @response(200, {
    description: 'Array of AuditLog model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(AuditLog, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(AuditLog) filter?: Filter<AuditLog>,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find(filter);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @patch('/audit-logs')
  @response(200, {
    description: 'AuditLog PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuditLog, {partial: true}),
        },
      },
    })
    auditLog: AuditLog,
    @param.where(AuditLog) where?: Where<AuditLog>,
  ): Promise<Count> {
    return this.auditLogRepository.updateAll(auditLog, where);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @get('/audit-logs/{id}')
  @response(200, {
    description: 'AuditLog model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(AuditLog, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(AuditLog, {exclude: 'where'})
    filter?: FilterExcludingWhere<AuditLog>,
  ): Promise<AuditLog> {
    return this.auditLogRepository.findById(id, filter);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @patch('/audit-logs/{id}')
  @response(204, {
    description: 'AuditLog PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuditLog, {partial: true}),
        },
      },
    })
    auditLog: AuditLog,
  ): Promise<void> {
    await this.auditLogRepository.updateById(id, auditLog);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @put('/audit-logs/{id}')
  @response(204, {
    description: 'AuditLog PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() auditLog: AuditLog,
  ): Promise<void> {
    await this.auditLogRepository.replaceById(id, auditLog);
  }

  @authenticate(STRATEGY.BEARER)
  @authorize({permissions: ['*']})
  @del('/audit-logs/{id}')
  @response(204, {
    description: 'AuditLog DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.auditLogRepository.deleteById(id);
  }
}
