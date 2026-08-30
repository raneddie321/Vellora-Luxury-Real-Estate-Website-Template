# Setup guide

For getting Editime running and making your first video. No prior setup
knowledge assumed.

---

## What you need

- A computer running macOS, Windows or Linux
- **Node.js 18.18 or newer** — download from <https://nodejs.org> (the "LTS"
  button is the right one)
- A recent **Chrome, Edge, Brave or Firefox**

You do **not** need an account, an API key, a credit card, or an internet
connection after the first install.

---

## Install

Open a terminal in the project folder and run:

```bash
npm install
```

This downloads the dependencies. It takes a minute or two the first time.

Then start the app:

```bash
npm run dev
```

You will see:

```
▲ Next.js 16
- Local: http://localhost:3000
```

Open <http://localhost:3000> in your browser. That is it.

> **Running it for real?** Use `npm run build` followed by `npm start` instead.
> The production build is considerably faster.

---

## Your first five minutes

### 1. Open the demo project

On the landing page click **Watch Demo**, or on the dashboard click **Open demo
project**.

The app generates three short video shots, an audio bed, a title card, animated
titles and captions **on your own machine**. It takes about five seconds. Nothing
is downloaded and nothing is uploaded — the media is created locally with the
same browser APIs the editor uses.

You now have a finished sequence to take apart.

### 2. Press Play

The transport bar sits under the preview. **Space** plays and pauses. The arrow
keys step one frame at a time.

### 3. Ask RAN for something

RAN is the assistant on the right. Click one of the suggested prompts, for
example **"Make this feel cinematic."**

RAN will answer with an **edit plan** — a numbered list of changes, each showing
what it does, roughly how long it takes and what it costs in credits. **Nothing
has happened to your video yet.**

Press **Apply All** to run everything, or **Apply** on individual steps to take
them one at a time. Either way, ⌘/Ctrl + Z undoes it — AI edits use exactly the
same undo history as your own.

### 4. Export

Click **Export** in the top-right, choose MP4, and press **Start export**.

The browser renders your timeline in real time, so a 15-second video takes about
15 seconds. Keep the tab in the foreground while it runs. When it finishes, press
**Download file** — that is a real video file you can play, upload or send.

---

## Making your own project

1. **Dashboard → New Project.** Pick an aspect ratio (16:9 for YouTube, 9:16 for
   TikTok and Reels, 1:1 or 4:5 for feed posts). You can change this later.
2. **Import media.** Drop files onto the Media panel, or click **Choose files**.
   Supported: MP4, MOV, WEBM, MP3, WAV, PNG, JPG, WEBP, up to 512 MB each.
3. **Build the sequence.** Drag an asset onto a track, or press the **+** button
   on it to append it to the end.
4. **Edit.** Drag clips to move them, drag their edges to trim, and press **S**
   to split at the playhead.
5. **Add polish.** The left rail has Text, Audio, Effects, Transitions, Elements
   and Templates.
6. **Ask RAN** whenever you would rather describe the result than build it.

Everything saves automatically as you work.

---

## Starting from a template

**Templates** in the sidebar has 17 ready-made structures across YouTube, TikTok,
Instagram, Ads, Corporate, Cinematic, Product, Real Estate and Social Media.

Applying one sets the frame size and lays out titles and transitions. Where the
template expects footage you have not imported, it creates a clearly-labelled
**slot** — a dashed clip that says what it is waiting for. Drag an asset onto a
slot to fill it.

---

## Keyboard shortcuts

The ones worth learning first:

| Key | Does |
| --- | --- |
| **Space** | Play / pause |
| **← →** | Step one frame |
| **Shift + ← →** | Jump one second |
| **S** | Split at the playhead |
| **Delete** | Delete the selected clip |
| **⌘/Ctrl + Z** | Undo |
| **⌘/Ctrl + Shift + Z** | Redo |
| **⌘/Ctrl + K** | AI command bar |

The full list is in **Settings › Keyboard Shortcuts**.

---

## Turning on the extra AI features

Editime works fully without this. Connecting a language model lets RAN handle
instructions outside its built-in vocabulary.

1. Copy `.env.example` to a new file called `.env.local`.
2. Add your key:

   ```bash
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. Stop the app (**Ctrl + C** in the terminal) and start it again.
4. Check **Settings › AI** — it will name your provider and model.

Other features (background removal, image and video generation, AI voice and
music) each need their own provider. **Settings › AI** lists exactly which
environment variable unlocks which feature. Until then they are labelled
**Requires API** and will not run — the app will not pretend to do something it
cannot.

---

## Where your work is stored

Everything lives in your browser, on your computer:

- **Projects** — browser local storage
- **Video, audio and images** — browser IndexedDB
- **Credits** — a local ledger; nothing is billed, ever, in this build

This means:

- Your media never leaves your machine.
- Your projects are tied to **this browser on this computer**. A different
  browser, or a cleared cache, means a fresh start.
- **Export anything you want to keep.** Exported files go to your normal
  Downloads folder and are yours.

**Settings › Storage** shows how much space you are using and can clear
everything.

---

## Troubleshooting

**"npm: command not found"**
Node.js is not installed, or the terminal was opened before installing it.
Install from <https://nodejs.org> and open a new terminal window.

**Port 3000 is already in use**
Something else is running there. Use another port:
`npm run dev -- --port 3005`

**The demo project will not generate**
Your browser may not support canvas recording. Try Chrome or Edge. You can still
create a project and import your own media.

**A file will not import**
The browser could not decode it. Re-encode to H.264 MP4 — the most reliable
format across browsers — and try again.

**The preview is black**
Check whether the playhead sits over a clip, and whether the video track is
hidden (the eye icon in the track header). The demo project deliberately opens
on a fade-up from black.

**Export produced a WebM when I asked for MP4**
Your browser cannot record H.264 and the MP4 converter could not load. The file
is still a valid, playable video — the app tells you exactly why the format
differs.

**A player shows my WebM as "unknown length"**
Expected: browsers write WebM as a live stream with no duration header. Export
MP4 for a fully seekable file.

**Export is slow**
It runs in real time — one second of video takes about one second to write. Keep
the tab in the foreground; background tabs are throttled by the browser.

**Everything disappeared**
Your browser cleared its storage, or you are in a different browser or a private
window. There is no cloud copy in this build.

---

## Getting the most out of RAN

RAN is best at instructions describing a *result*, not a mechanism.

Works well:

- "Make this feel cinematic."
- "Remove the silence."
- "Turn this into a 30 second social video."
- "Add subtitles."
- "Create a dramatic intro."
- "Make the colors warmer."
- "Create a fast-paced montage."
- "Make this look like a Hollywood trailer."

Two things worth knowing:

- **Selection is context.** With a clip selected, RAN works on that clip. With
  nothing selected, it works on the whole sequence.
- **Read the plan before applying it.** Each step has a preview (the eye icon)
  stating precisely what it will change. Skip anything you do not want.
