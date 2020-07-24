import { Moment} from 'moment';

export class Note {
  id: string;
  summary: string;
  status: string;
  createdAt: Moment;
  dueDate: Moment;
  createdBy: string;
  tags: string[];
}

export const NOTE_TAGS: string[] =  ['new','urgent','place','dish','music'];