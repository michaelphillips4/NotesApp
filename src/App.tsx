import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import type { Schema } from "../amplify/data/resource";

Amplify.configure(outputs);
const client = generateClient<Schema>();

type Note = {
  name: string | null;
  description: string | null;
};

function hasRequiredValues(n: Note): unknown {
  return (
    n.name !== null &&
    n.description !== null &&
    n.name.length > 0 &&
    n.description.length > 0
  );
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => note)
    );
    setNotes(notes);
  }

  async function createNote(): Promise<void> {
    const note: Note = {
      name,
      description,
    };
    if (hasRequiredValues(note)) {
      await client.models.Note.create(note);
      setOpenSaveDialog(false);
      setErrorMessage("");
      fetchNotes();
    } else {
      setErrorMessage("Both a Title and Comment are Required.");
    }
  }

  return (
    <>

      <p>
        Please log comments and bugs below. With bugs please include as much
        details as possible and ideally include the steps to recreate.
        Thanks for taking the time to add logs.
      </p>
      <button onClick={() => setOpenSaveDialog(!openSaveDialog)}>
        Add New Comment/Bug
      </button>
      <dialog open={openSaveDialog}>
        <label htmlFor="noteName">Title</label>

        <input
          required
          id="noteName"
          onInput={(e) => setName(e.currentTarget.value)}
        />
        <label htmlFor="noteDescription">Comment</label>
        <textarea
          required
          cols={30}
          id="noteDescription"
          onInput={(e) => setDescription(e.currentTarget.value)}
        />

        <p>{errorMessage}</p>

        <button onClick={createNote}>Save</button>

        <button onClick={() => {
          setOpenSaveDialog(!openSaveDialog);
          setErrorMessage("")
        }}>
          Close
        </button>
      </dialog>
      <ol>
        {notes
          .filter((n) => hasRequiredValues(n))
          .map((note, i) => (
            <li key={i}>
              <p>
                <b>{note.name}</b>:{note.description}
              </p>
            </li>
          ))}
      </ol>

    </>
  );
}
