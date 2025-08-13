import { Handler } from "../../core/handler.js";
import type { HandlerResponse } from "../../types/handlerResponse.js";
import DatabaseConnector from "../../core/databaseConnector.js";

interface ActiveChat {
    id: number;
    client_id: number;
    contact_id: number;
    channel_id: number;
    provider_channel_id: number;
    origin_src: string;
    origin_dst: string;
    chat_id: string;
    start_timestamp: string;
    end_timestamp: string;
}

type Output = {
    activeChats: ActiveChat[]
}

const connector = new DatabaseConnector();

export default class getAllActiveChats extends Handler<void, Output> {
    async execute(): Promise<HandlerResponse<Output>> {
        try {
            const connection = await connector.generateConnection();
            const result = await connection.query(`
                SELECT 
                    id,
                    client_id,
                    contact_id,
                    channel_id,
                    provider_channel_id,
                    origin_src,
                    origin_dst,
                    chat_id,
                    start_timestamp,
                    end_timestamp 
                FROM 
                    xdr_base
                WHERE is_chat_active = true
                ORDER BY start_timestamp DESC
            `);

            return this.success({
                activeChats: result.rows
            })
        } catch {
            return this.fail('database', 'Error fetching active chats');
        }
    }
}