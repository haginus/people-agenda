import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Note } from '../../people.service';

@Component({
  selector: 'app-note-editor',
  templateUrl: './note-editor.component.html',
  styleUrls: ['./note-editor.component.scss']
})
export class NoteEditorComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: NoteEditorData) {
    if(data.noteId != undefined) this.note = { ...data.notes[data.noteId] }
  }

  note: Note = {title: null, content: null, timestamp: new Date().getTime()}

  ngOnInit(): void {
  }

  saveNote() {
    if(this.data.noteId != undefined)
      this.data.notes[this.data.noteId] = this.note;
    else this.data.notes.push(this.note);
  }

  deleteNote() {
    this.data.notes.splice(this.data.noteId, 1);
  }

}

export interface NoteEditorData {
  notes: Note[],
  noteId?: number,
  mode: 'edit' | 'delete'
}
