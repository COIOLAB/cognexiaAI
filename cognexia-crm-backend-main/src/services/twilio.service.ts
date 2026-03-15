import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;
  private readonly logger = new Logger(TwilioService.name);

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized successfully.');
    } else {
      this.logger.warn('Twilio credentials not found. Twilio Service will not work.');
    }
  }

  async initiateCall(to: string, from: string): Promise<any> {
    if (!this.twilioClient) {
      throw new InternalServerErrorException('Twilio is not configured properly.');
    }

    try {
      this.logger.log(`Initiating call from ${from} to ${to}`);
      
      const call = await this.twilioClient.calls.create({
        to,
        from,
        twiml:
        //  '<Response><Dial>Connecting your call.</Dial></Response>'
         '<Response><Say>Please wait while we connect you to an agent.</Say><Dial>+919336326538</Dial></Response>',
      });
      
      this.logger.log(`Call initiated successfully. Call SID: ${call.sid}`);
      return call;
    } catch (error) {
      this.logger.error(`Failed to initiate Twilio call: ${error.message}`);
      throw new InternalServerErrorException(`Failed to initiate Call: ${error.message}`);
    }
  }
}
