import { SurveyResponse, SurveyResults, ExportOptions } from '../types/index.js';

export class DataExporter {
  private responses: SurveyResponse[];

  constructor(responses: SurveyResponse[]) {
    this.responses = responses;
  }

  public export(options: ExportOptions): string | object | SurveyResults {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(options);
      case 'json':
        return this.exportToJSON(options);
      case 'object':
        return this.exportToObject(options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private exportToCSV(options: ExportOptions): string {
    if (this.responses.length === 0) {
      return '';
    }

    const headers = this.getCSVHeaders(options);
    const rows = this.responses.map(response => this.responseToCSVRow(response, options));
    
    return [headers.join(','), ...rows].join('\n');
  }

  private exportToJSON(options: ExportOptions): string {
    const data = this.exportToObject(options);
    return JSON.stringify(data, null, 2);
  }

  private exportToObject(options: ExportOptions): SurveyResults {
    return {
      responses: this.responses.map(response => this.filterResponseData(response, options)),
      summary: this.generateSummary()
    };
  }

  private getCSVHeaders(options: ExportOptions): string[] {
    const headers = ['sessionId', 'completed'];
    
    if (options.includeTimestamps) {
      headers.push('startTime', 'endTime');
    }
    
    const questionIds = new Set<string>();
    this.responses.forEach(response => {
      response.answers.forEach(answer => {
        questionIds.add(answer.questionId);
      });
    });
    
    headers.push(...Array.from(questionIds).sort());
    
    if (options.includeMetadata) {
      headers.push('metadata');
    }
    
    return headers;
  }

  private responseToCSVRow(response: SurveyResponse, options: ExportOptions): string[] {
    const row: string[] = [
      response.sessionId,
      response.completed.toString()
    ];
    
    if (options.includeTimestamps) {
      row.push(
        response.startTime.toISOString(),
        response.endTime?.toISOString() || ''
      );
    }
    
    const questionIds = new Set<string>();
    this.responses.forEach(r => {
      r.answers.forEach(answer => {
        questionIds.add(answer.questionId);
      });
    });
    
    const sortedQuestionIds = Array.from(questionIds).sort();
    
    sortedQuestionIds.forEach(questionId => {
      const answer = response.answers.find(a => a.questionId === questionId);
      if (answer) {
        const value = Array.isArray(answer.value) 
          ? answer.value.join('; ') 
          : String(answer.value);
        row.push(`"${value.replace(/"/g, '""')}"`);
      } else {
        row.push('');
      }
    });
    
    if (options.includeMetadata) {
      const metadataStr = response.metadata 
        ? JSON.stringify(response.metadata).replace(/"/g, '""')
        : '';
      row.push(`"${metadataStr}"`);
    }
    
    return row;
  }

  private filterResponseData(response: SurveyResponse, options: ExportOptions): SurveyResponse {
    const filteredResponse: SurveyResponse = {
      surveyId: response.surveyId,
      sessionId: response.sessionId,
      answers: response.answers,
      completed: response.completed,
      startTime: response.startTime,
      endTime: response.endTime
    };
    
    if (options.includeMetadata) {
      filteredResponse.metadata = response.metadata;
    } else {
      delete filteredResponse.metadata;
    }
    
    return filteredResponse;
  }

  private generateSummary(): SurveyResults['summary'] {
    const totalResponses = this.responses.length;
    const completedResponses = this.responses.filter(r => r.completed).length;
    const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
    
    const completedWithEndTime = this.responses.filter(r => r.completed && r.endTime);
    const averageTime = completedWithEndTime.length > 0 
      ? completedWithEndTime.reduce((sum, r) => {
          const duration = r.endTime!.getTime() - r.startTime.getTime();
          return sum + duration;
        }, 0) / completedWithEndTime.length
      : 0;
    
    const questionStats: Record<string, any> = {};
    
    this.responses.forEach(response => {
      response.answers.forEach(answer => {
        if (!questionStats[answer.questionId]) {
          questionStats[answer.questionId] = {
            answers: [],
            uniqueAnswers: new Set()
          };
        }
        
        const values = Array.isArray(answer.value) ? answer.value : [answer.value];
        values.forEach(value => {
          questionStats[answer.questionId].answers.push(value);
          questionStats[answer.questionId].uniqueAnswers.add(value);
        });
      });
    });
    
    Object.entries(questionStats).forEach(([questionId, stats]) => {
      const answerCounts: Record<string, number> = {};
      
      stats.answers.forEach((answer: string) => {
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      });
      
      const mostCommonAnswers = Object.entries(answerCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      questionStats[questionId] = {
        totalAnswers: stats.answers.length,
        uniqueAnswers: stats.uniqueAnswers.size,
        mostCommonAnswers
      };
    });
    
    return {
      totalResponses,
      completionRate: Math.round(completionRate * 100) / 100,
      averageTime: Math.round(averageTime),
      questionStats
    };
  }

  public static exportToFile(data: string, filename: string, mimeType: string = 'text/plain'): void {
    if (typeof window !== 'undefined' && window.Blob && window.URL) {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      import('fs').then(fs => {
        fs.writeFileSync(filename, data, 'utf8');
      });
    }
  }

  public static exportResponsesToCSV(responses: SurveyResponse[], options: ExportOptions = { format: 'csv' }): string {
    const exporter = new DataExporter(responses);
    return exporter.export(options) as string;
  }

  public static exportResponsesToJSON(responses: SurveyResponse[], options: ExportOptions = { format: 'json' }): string {
    const exporter = new DataExporter(responses);
    return exporter.export(options) as string;
  }

  public static exportResponsesToObject(responses: SurveyResponse[], options: ExportOptions = { format: 'object' }): SurveyResults {
    const exporter = new DataExporter(responses);
    return exporter.export(options) as SurveyResults;
  }
}
