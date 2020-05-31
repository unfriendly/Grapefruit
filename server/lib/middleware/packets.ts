import { URL } from "url"

type HttpVerbs = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH'

interface Req {
  headers: Map<string, string>;
  url: URL;
  method: HttpVerbs;
  body: string;
  uuid: string;
  status: number;

  begin: Date;
  end: Date;
}

export default class Packets {
  sessions = new Map<string, Req>()
  
  add(req: Req): void {
    this.sessions.set(req.uuid, req)
  }

  requests(): Array<Req> {
    return [...this.sessions.values()]
  }
}
