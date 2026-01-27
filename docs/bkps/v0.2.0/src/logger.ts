import { Notice } from "obsidian";

export interface LogEntry {
	timestamp: string;
	level: 'INFO' | 'WARN' | 'ERROR';
	message: string;
	data?: any;
}

export class Logger {
	private logs: LogEntry[] = [];
	private maxLogs = 50;

	log(message: string, level: LogEntry['level'] = 'INFO', data?: any) {
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			message,
			data
		};
		
		this.logs.unshift(entry);
		if (this.logs.length > this.maxLogs) {
			this.logs.pop();
		}
		
		// Log para o console do desenvolvedor também
		const consoleMsg = `[SmartWrite ${level}] ${message}`;
		if (level === 'ERROR') console.error(consoleMsg, data);
		else if (level === 'WARN') console.warn(consoleMsg, data);
		else console.log(consoleMsg, data);
	}

	getLogs(): LogEntry[] {
		return this.logs;
	}

	getFormattedLogs(): string {
		return this.logs
			.map(l => `[${l.timestamp}] ${l.level}: ${l.message} ${l.data ? JSON.stringify(l.data) : ''}`)
			.join('\n');
	}

	clear() {
		this.logs = [];
	}
}
