import {writeFile, mkdir} from "fs/promises";
import {dirname} from "path";
import {debounce} from "lodash-es";
import {InMemStorage} from "./inMemStorage.ts";
import {InsertMessage, Message} from "@shared/schema.ts";
import {mapToObj} from "@shared/utils.ts";

export class PersistInMemStorage extends InMemStorage {
  private readonly filePath: string;
  private saving = false;
  private pendingSave = false;

  public constructor(filePath: string) {
    super()
    this.filePath = filePath;
    this.saveToDisk = debounce(this.saveToDisk.bind(this), 100);
  }

  private toJson(): string {
    const obj = {
      messages: mapToObj(this.messages),
      faceEmotions: mapToObj(this.faceEmotions),
      sessions: mapToObj(this.sessions),
    }
    return JSON.stringify(obj);
  }

  private async saveToDisk(): Promise<void> {
    if (this.saving) {
      this.pendingSave = true;
      return;
    }

    this.saving = true;
    try {
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, this.toJson());
    } catch (err) {
      console.error('Failed to save data:', err);
    } finally {
      this.saving = false;
      if (this.pendingSave) {
        this.pendingSave = false;
        this.saveToDisk();
      }
    }
  }

  public createMessage(message: InsertMessage): Promise<Message> {
    const result = super.createMessage(message);
    result.then(this.saveToDisk.bind(this));
    return result;
  }

  // createFaceEmotion(faceEmotion: InsertFaceEmotion): Promise<FaceEmotion>;

  //createSession(insertSession: InsertSession): Promise<Session>;

}