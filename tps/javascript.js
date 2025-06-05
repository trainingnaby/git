import {
  Body,
  Controller,
  Post,
  Res,
  Headers,
  HttpException,
  HttpStatus,
  Get,
  Param,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { Response } from 'express';

import { LoggerService } from 'src/services/logger/logger.service';
import { AppConfigService } from 'src/services/config/appconfiguration.service';
import * as https from 'https';
import { PersoService } from 'src/services/perso/perso.service';
import { join } from 'path';

const LogTagController = '[AIAgentsController]';

/**
 * Represents a session create query.
 *
 * This class is used to manage the payload data sent by the frontend part.
 */
export class CreateSessionQueryDto {
  @ApiProperty({
    type: 'string',
    example: 'john.doe@valtech.com',
  })
  user: string;

  @ApiProperty({
    type: 'string',
    example: 'reputation-review-creator',
  })
  technicalAgentID: string;

  @ApiProperty({
    type: 'string',
    example: 'Intelligence',
    enum: ['azure', 'langchain', 'rag'],
  })
  type: string;
}

export class CreateSesssionResultDto {
  @ApiProperty({
    type: 'string',
    example: 'l7kqip-5w23bhmkgxz',
  })
  sessionID: string;
}

/**
 * generate session ID, like 'l7kqip-5w23bhmkgxz'.
 *
 * this is to used only when agent type is 'langchain' or 'rag'.
 **/
function generateSessionID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

export class HistoryItemDto {
  @ApiProperty({
    type: 'string',
    example: 'user',
    enum: ['user', 'assistant'],
  })
  role: string;

  @ApiProperty({
    type: 'string',
    example: 'tell me more about the sales documents.',
  })
  content: string;
}

export class QueryDto {
  @ApiProperty({
    type: 'string',
    example: 'rag',
    description: 'this is the internal agent ID.',
    enum: ['azure', 'langchain', 'rag'],
  })
  technicalAgentID: string;

  @ApiProperty({
    type: 'string',
    example: 'rag',
    description:
      'this is the internal agent type, this is required to perform the routing to the right endpoint.',
    enum: ['azure', 'langchain', 'rag'],
  })
  type: string;

  @ApiProperty({
    type: 'string',
    description:
      'this is the query sent to the AI agent, it will reply back with a response.',
    example: 'what is your purpose ?',
  })
  query: string;

  @ApiProperty({
    type: 'string',
    description:
      'this is the session ID, the front must create it per user and per agent.',
    example: 'l7kqip-5w23bhmkgxz',
  })
  sessionID: string;

  @ApiProperty({
    type: 'string',
    description: 'this is the user info, retrieved as a logged-in user.',
    example: 'john.doe@acme.org',
  })
  user?: string;

  @ApiProperty({
    type: [HistoryItemDto],
    description:
      '[APPLY TO LANGCHAIN TYPE ONLY] this is an array of chat history items, the front must manage it per user and per agent.',
    required: false,
  })
  chatHistory?: [HistoryItemDto];
}

interface InputConfigurationOneAgentData {
  welcomeSentence?: string;
  questions_suggestions?: string[];
  agent: {
    agentId: string;
    type: string;
  };
}

interface InputConfigurationOneAgent {
  success: boolean;
  data: InputConfigurationOneAgentData;
}

interface OutputConfigurationOneAgentData {
  welcomeSentence?: string;
  questionSuggestions?: string[];
  type: string;
}

function convertConfigurationOneAgentData(
  input: InputConfigurationOneAgentData,
): OutputConfigurationOneAgentData {
  return {
    welcomeSentence: input.welcomeSentence,
    questionSuggestions: input.questions_suggestions,
    type: input.agent.type,
    technicalAgentID: input.agent.agentId,
  } as OutputConfigurationOneAgentData;
}

interface ExternalServiceGetPagesResponseItem {
  slug: string;
  welcomeSentence?: string;
  questions_suggestions?: string[];
}

export async function externalServiceGetPages(
  options: https.RequestOptions,
): Promise<ExternalServiceGetPagesResponseItem[]> {
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        let bodyAsJSON: ExternalServiceGetPagesResponseItem[];
        try {
          bodyAsJSON = JSON.parse(data);
          resolve(bodyAsJSON);
        } catch (error) {
          const errorMessage = `the external service at URL https://${join(
            options.hostname,
            request.path,
          )} returns a non JSON response - received body starts with "${data.slice(
            0,
            10,
          )}"`;
          reject(
            new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
          );
          return;
        }
      });
    });

    request.on('error', (error) => {
      const errorMessage = `the request to external service '${
        options.method
      } https://${join(
        options.hostname,
        request.path,
      )}' returns a failed response (${error.message})`;
      reject(new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR));
    });

    request.end();
  });
}

export async function makeRequestToExternalService(
  options: https.RequestOptions,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        let bodyAsJSON: InputConfigurationOneAgent;
        try {
          bodyAsJSON = JSON.parse(data);
        } catch (error) {
          const errorMessage = `the external service at URL https://${join(
            options.hostname,
            request.path,
          )} returns a non JSON response - received body starts with "${data.slice(
            0,
            10,
          )}"`;
          reject(
            new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
          );
          return;
        }
        if (bodyAsJSON.success) {
          resolve(bodyAsJSON.data);
        } else {
          const errorMessage = `the external service at URL ${join(
            options.hostname,
            request.path,
          )} returns a failed response`;
          reject(
            new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR),
          );
        }
      });
    });

    request.on('error', (error) => {
      const errorMessage = `the request to external service '${
        options.method
      } https://${join(
        options.hostname,
        request.path,
      )}' returns a failed response (${error.message})`;
      reject(new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR));
    });

    request.end();
  });
}

@ApiTags('ai')
@ApiBearerAuth()
@Controller()
export class AIAgentsController {
  constructor(
    private readonly logger: LoggerService,
    private readonly appConfigService: AppConfigService,
    private readonly persoService: PersoService,
  ) {}

  @ApiOperation({
    summary: 'get configuration for the specied agent.',
    description: `<h2>usage</h2>
this endpoint returns the agent configuration matching the specified agentID.
<h2>doc</h2>
<a href="https://dev.azure.com/RolexDigital/Brand%20Centre%20v2%20-%20Rolex/_wiki/wikis/bff%20architecture/77/README" target="_">ai agents controller wiki</a>
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            welcomeSentence: {
              type: 'string',
              description: 'this is the welcome sentence.',
              example:
                'Ask me any question and I will provide you with insights about Rolex with data gathered from our reporting, press reviews and strategic documents.',
            },
            questionSuggestions: {
              type: 'array',
              items: { type: 'string' },
              description: 'this is a list of question suggestions.',
              example: [
                'How is Rolex performing in the UK?',
                'What are the latest topics of conversation about Rolex in the press?',
                'In 2024, what are the best and worst performing Rolex posts on social media?',
              ],
            },
            technicalAgentID: {
              type: 'string',
              description:
                'this is the technical agent ID, it must be used when dealing with [/api/ai/messages](#/ai/AIAgentsController_messages) endpoint.',
              example: 'Intelligence',
            },
            type: {
              type: 'string',
              example: 'rag',
              enum: ['rag', 'langchain'],
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: {
              type: 'number',
              example: 500,
            },
            message: {
              type: 'string',
              example: 'error when trying to ...',
            },
          },
        },
      },
    },
  })
  @ApiParam({
    name: 'agentID',
    description:
      'The unique identifier of the agent (this value is specified in ContentStack (content_type: ))',
    example: 'intelligence',
  })
  @Get('/ai/configurations/:agentID')
  async getConfigurationOneAgent(
    @Param('agentID') agentID: string,
    @Res() res: Response,
    @Headers('authorization') headerValue: string,
  ) {
    const userInfo = await this.persoService.getUserInfo(headerValue);
    if (!userInfo) {
      throw new HttpException(
        'Unable to read user information',
        HttpStatus.FORBIDDEN,
      );
    }
    const externalServiceUrl =
      this.appConfigService.getAIAgentsConfigurationURL();

    const externalServiceUrlParsed = new URL(externalServiceUrl);

    const options: https.RequestOptions = {
      hostname: externalServiceUrlParsed.hostname,
      path: join(externalServiceUrlParsed.pathname, 'page', agentID),
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    await makeRequestToExternalService(options)
      .then((dataAsJSON) => {
        const converted = convertConfigurationOneAgentData(dataAsJSON);
        res.status(200).send(converted);
      })
      .catch((error) => {
        this.logger.error(
          `[AIAgentsController][getConfigurationOneAgent] error = ${error}`,
        );
        throw new HttpException(
          `Unable to get configuration data = ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  @ApiOperation({
    summary: 'get configuration for all agents.',
    description: `<h2>usage</h2>
this endpoint returns all the agent configurations, this is for DEBUG purpose only.
<h2>doc</h2>
<a href="https://dev.azure.com/RolexDigital/Brand%20Centre%20v2%20-%20Rolex/_wiki/wikis/bff%20architecture/77/README" target="_">ai agents controller wiki</a>
    `,
  })
  @Get(`/ai/configurations`)
  async getConfigurationAllAgents(
    @Res() res: Response,
    @Headers('authorization') headerValue: string,
  ) {
    const userInfo = await this.persoService.getUserInfo(headerValue);
    if (!userInfo) {
      throw new HttpException(
        'Unable to read user information',
        HttpStatus.FORBIDDEN,
      );
    }

    const externalServiceUrl =
      this.appConfigService.getAIAgentsConfigurationURL();

    const externalServiceUrlParsed = new URL(externalServiceUrl);

    const options: https.RequestOptions = {
      hostname: externalServiceUrlParsed.hostname,
      path: join(externalServiceUrlParsed.pathname, 'pages'),
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    await externalServiceGetPages(options)
      .then(async (pages) => {
        const results = [];
        for (const page of pages) {
          this.logger.info(
            `[AIAgentsController][getConfigurationAllAgents] retrieving configuration for ${page.slug}`,
          );
          const agentID = page.slug;
          const options: https.RequestOptions = {
            hostname: externalServiceUrlParsed.hostname,
            path: join(externalServiceUrlParsed.pathname, 'page', agentID),
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          };
          await makeRequestToExternalService(options)
            .then((dataAsJSON) => {
              const tmp = {
                agentID: agentID,
                technicalAgentID: dataAsJSON?.agent?.agentId,
                type: dataAsJSON?.agent?.type,
                welcomeSentence: page.welcomeSentence,
                questionSuggestions: page.questions_suggestions,
              };
              results.push(tmp);
            })
            .catch((error) => {
              this.logger.error(
                `[AIAgentsController][getConfigurationAllAgents] error = ${error}`,
              );
              throw new HttpException(
                `error when retrieving configuration data = ${error}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            });
        }
        res.status(200).send(results);
      })
      .catch((error) => {
        this.logger.error(
          `[AIAgentsController][getConfigurationAllAgents] error = ${error}`,
        );
        throw new HttpException(
          `error when retrieving configuration data = ${error}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
  }

  @ApiOperation({
    summary: 'create a session.',
    description: `<h2>usage</h2>
this endpoint create a session, the session ID must be sent back when posting messages.
<h2>doc</h2>
<a href="https://dev.azure.com/RolexDigital/Brand%20Centre%20v2%20-%20Rolex/_wiki/wikis/bff%20architecture/77/README" target="_">ai agents controller wiki</a>
    `,
  })
  @ApiParam({
    name: 'agentID',
    description:
      'The unique identifier of the agent (this value is specified in ContentStack (content_type: ))',
    example: 'intelligence',
  })
  @Post(`/ai/sessions/:agentID`)
  async createSession(
    @Param('agentID') agentID: string,
    @Res() res: Response,
    @Body() createSessionQueryDto: CreateSessionQueryDto,
    @Headers('authorization') headerValue: string,
  ) {
    const userInfo = await this.persoService.getUserInfo(headerValue);
    if (!userInfo) {
      throw new HttpException(
        'Unable to read user information',
        HttpStatus.FORBIDDEN,
      );
    }

    class AgentAzurePostThreadResult {
      session_id: string;
    }

    const result = new CreateSesssionResultDto();
    if (createSessionQueryDto.type === 'azure') {
      const baseDirURLTypeAzure =
        this.appConfigService.getAIAgentsBaseDirURLTypeAzure();
      const url = join(baseDirURLTypeAzure, 'threads');

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new HttpException(
              'Unable to create OpenaAI Assistant thread',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          return response.json();
        })
        .then((result) => {
          const data = new AgentAzurePostThreadResult();
          data.session_id = result.thread_id;
          res.status(HttpStatus.OK).send(data);
        })
        .catch((error) => {
          throw new HttpException(
            `Unable to create OpenaAI Assistant thread, ${error}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        });
    } else {
      result.sessionID = generateSessionID();
      res.status(HttpStatus.OK).json(result);
    }
  }

  @ApiOperation({
    summary: 'create a message to ai agent',
    description: `<h2>usage</h2>
this endpoint manages incoming user's message and returns a stream of responses as chunks.
<h2>doc</h2>
<a href="https://dev.azure.com/RolexDigital/Brand%20Centre%20v2%20-%20Rolex/_wiki/wikis/bff%20architecture/77/README" target="_">ai agents controller wiki</a>
`,
  })
  @ApiParam({
    name: 'agentID',
    description: 'This is the agent ID',
    example: 'intelligence',
  })
  @ApiResponse({
    status: 200,
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example:
            '{"type": "answer", "text": "I am f"}\n{"type": "answer", "text": "ine and"}\n{"type": "answer", "text": " you ?"}',
        },
      },
    },
  })
  @Post(`/ai/messages/:agentID`)
  async messages(
    @Param('agentID') agentID: string,
    @Body() queryDto: QueryDto,
    @Res() res: Response,
    @Headers('authorization') headerValue: string,
  ) {
    const LogTagMethod = '[messages]';
    const userInfo = await this.persoService.getUserInfo(headerValue);
    if (!userInfo) {
      throw new HttpException(
        'Unable to read user information',
        HttpStatus.FORBIDDEN,
      );
    }

    let messagesURL: URL;
    if (queryDto.type === 'azure') {
      messagesURL = new URL(
        join(
          this.appConfigService.getAIAgentsBaseDirURLTypeAzure(),
          'threads',
          queryDto.sessionID,
          'messages_streaming',
        ),
      );
    } else {
      messagesURL = new URL(
        this.appConfigService.getAIAgentsMessagesURL(queryDto.type),
      );
    }

    let externalServiceData: any;
    if (queryDto.type === 'rag') {
      externalServiceData = {
        query: queryDto.query,
        assistant: queryDto.technicalAgentID,
        session: queryDto.sessionID,
        user: queryDto.user,
      };
    } else if (queryDto.type === 'langchain') {
      externalServiceData = {
        agent_id: queryDto.technicalAgentID,
        langfuse_name: agentID,
        content: queryDto.query,
        session_id: queryDto.sessionID,
        chat_history: queryDto.chatHistory,
        trace_id: '09182098', // TODO - I am not sure about the behaviour
      };
    } else if (queryDto.type === 'azure') {
      externalServiceData = {
        assistant_id: queryDto.technicalAgentID,
        langfuse_name: agentID,
        content: queryDto.query,
        session_id: queryDto.sessionID,
      };
    } else {
      throw new HttpException(
        `unknown agent type - received: ${queryDto.type}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const externalServiceDataAsJSON = JSON.stringify(externalServiceData);
    this.logger.info(
      `[AIAgentsController][messages] externalServiceData = ${externalServiceDataAsJSON}`,
    );

    const options: https.RequestOptions = {
      hostname: messagesURL.hostname,
      path: messagesURL.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const externalRequest = https.request(options, (externalResponse) => {
      const statusCode = externalResponse.statusCode;
      if (statusCode !== 200) {
        this.logger.error(
          `${LogTagController}${LogTagMethod} wrong status code = got ${statusCode} instead of 200`,
        );
        res.status(502).send(`External service error: ${statusCode}`);
        return;
      }

      externalResponse.once('data', () => {
        this.logger.info(
          `${LogTagController}${LogTagMethod} streaming is starting from ${messagesURL}.`,
        );
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      externalResponse.pipe(res);

      externalResponse.on('error', (err) => {
        this.logger.error(
          `${LogTagController}${LogTagMethod} streaming received an error from ${messagesURL} = ${err}.`,
        );
        res.end();
      });

      externalResponse.on('end', () => {
        this.logger.info(
          `${LogTagController}${LogTagMethod} streaming is ended from ${messagesURL}.`,
        );
        res.end();
      });
    });
    externalRequest.write(externalServiceDataAsJSON);
    externalRequest.end();

    externalRequest.on('error', (err) => {
      this.logger.error(
        `${LogTagController}${LogTagMethod} streaming cannot start from ${messagesURL} = ${err.message}.`,
      );
      res.status(502);
      res.send('Unable to fetch data from the external service');
      res.end();
    });
  }
}
