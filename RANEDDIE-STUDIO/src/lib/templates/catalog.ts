import type { Template } from '@/lib/types'

/**
 * The template library.
 *
 * A template is pure data describing a timeline in terms of *slots*. Applying
 * one sets the project's aspect ratio, resolution and fps, lays out text and
 * transitions, and creates clearly-labelled placeholder clips for the media the
 * user has not supplied yet — it never invents footage.
 */
export const TEMPLATES: Template[] = [
  {
    id: 'yt-essential',
    name: 'YouTube Essential',
    category: 'YouTube',
    description: 'Hook, title, body and end card — the shape most long-form videos actually use.',
    duration: 34,
    aspectRatio: '16:9',
    tags: ['long-form', 'talking head', 'end card'],
    gradient: ['#FF6B35', '#7C1D0B'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 4, accepts: 'video', label: 'Hook', transitionIn: { type: 'fade', duration: 0.6 } },
            { kind: 'media', start: 4, duration: 24, accepts: 'video', label: 'Main body', transitionIn: { type: 'dissolve', duration: 0.4 } },
            { kind: 'media', start: 28, duration: 6, accepts: 'video', label: 'End card', transitionIn: { type: 'dissolve', duration: 0.5 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 0.4, duration: 3, content: 'THE HOOK', preset: 'kicker', animation: 'blur-in' },
            { kind: 'text', start: 4.2, duration: 3.5, content: 'Video Title Goes Here', preset: 'heading', animation: 'slide-up' },
            { kind: 'text', start: 28.5, duration: 5, content: 'Subscribe for more', preset: 'subheading', animation: 'fade' },
          ],
        },
        { kind: 'audio', name: 'Music', volume: 0.35, clips: [{ kind: 'media', start: 0, duration: 34, accepts: 'audio', label: 'Music bed', volume: 0.35 }] },
      ],
    },
  },
  {
    id: 'yt-shorts-hook',
    name: 'Shorts Hook',
    category: 'YouTube',
    description: 'Nine-second vertical opener built to stop a scroll in the first frame.',
    duration: 9,
    aspectRatio: '9:16',
    tags: ['shorts', 'vertical', 'fast'],
    gradient: ['#7C6BFF', '#211A63'],
    blueprint: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 3, accepts: 'video', label: 'Hook', effects: [{ type: 'color', presetId: 'color-punch' }] },
            { kind: 'media', start: 3, duration: 3, accepts: 'video', label: 'Payoff', transitionIn: { type: 'zoom', duration: 0.25 } },
            { kind: 'media', start: 6, duration: 3, accepts: 'video', label: 'CTA', transitionIn: { type: 'slide', duration: 0.25 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 0.1, duration: 2.6, content: 'WAIT FOR IT', preset: 'statement', animation: 'pop' },
            { kind: 'text', start: 6.2, duration: 2.6, content: 'Follow for part 2', preset: 'subheading', animation: 'slide-up' },
          ],
        },
      ],
    },
  },
  {
    id: 'tiktok-listicle',
    name: 'TikTok Listicle',
    category: 'TikTok',
    description: 'Numbered beats with bold captions — the format that carries most explainer content.',
    duration: 21,
    aspectRatio: '9:16',
    tags: ['listicle', 'captions', 'vertical'],
    gradient: ['#00E5B0', '#04473A'],
    blueprint: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 3, accepts: 'video', label: 'Intro' },
            { kind: 'media', start: 3, duration: 6, accepts: 'video', label: 'Point 1', transitionIn: { type: 'slide', duration: 0.3 } },
            { kind: 'media', start: 9, duration: 6, accepts: 'video', label: 'Point 2', transitionIn: { type: 'slide', duration: 0.3 } },
            { kind: 'media', start: 15, duration: 6, accepts: 'video', label: 'Point 3', transitionIn: { type: 'slide', duration: 0.3 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 0.2, duration: 2.6, content: '3 THINGS NOBODY TELLS YOU', preset: 'statement', animation: 'pop' },
            { kind: 'text', start: 3.2, duration: 5.4, content: '01', preset: 'kicker', animation: 'fade' },
            { kind: 'text', start: 9.2, duration: 5.4, content: '02', preset: 'kicker', animation: 'fade' },
            { kind: 'text', start: 15.2, duration: 5.4, content: '03', preset: 'kicker', animation: 'fade' },
          ],
        },
      ],
    },
  },
  {
    id: 'ig-reel-story',
    name: 'Reel Story',
    category: 'Instagram',
    description: 'A three-act vertical reel with a quiet open and a hard close.',
    duration: 18,
    aspectRatio: '9:16',
    tags: ['reel', 'story', 'cinematic'],
    gradient: ['#FF3D77', '#4A0B29'],
    blueprint: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 6, accepts: 'video', label: 'Setup', transitionIn: { type: 'fade', duration: 0.8 }, effects: [{ type: 'color', presetId: 'color-cinematic' }] },
            { kind: 'media', start: 6, duration: 6, accepts: 'video', label: 'Turn', transitionIn: { type: 'dissolve', duration: 0.5 } },
            { kind: 'media', start: 12, duration: 6, accepts: 'video', label: 'Close', transitionIn: { type: 'dissolve', duration: 0.5 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [{ kind: 'text', start: 12.5, duration: 5, content: 'Your line here.', preset: 'quote', animation: 'fade' }],
        },
        { kind: 'audio', name: 'Music', volume: 0.5, clips: [{ kind: 'media', start: 0, duration: 18, accepts: 'audio', label: 'Music bed', volume: 0.5 }] },
      ],
    },
  },
  {
    id: 'ig-carousel-motion',
    name: 'Square Motion Post',
    category: 'Instagram',
    description: 'A 1:1 loop for feed posts, with a statement card that lands in the middle.',
    duration: 12,
    aspectRatio: '1:1',
    tags: ['square', 'loop', 'feed'],
    gradient: ['#FFB020', '#5A3703'],
    blueprint: {
      aspectRatio: '1:1',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 6, accepts: 'video', label: 'Loop A' },
            { kind: 'media', start: 6, duration: 6, accepts: 'video', label: 'Loop B', transitionIn: { type: 'dissolve', duration: 0.6 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [{ kind: 'text', start: 4, duration: 4, content: 'One idea. One post.', preset: 'statement', animation: 'blur-in' }],
        },
      ],
    },
  },
  {
    id: 'ad-direct-response',
    name: 'Direct Response Ad',
    category: 'Ads',
    description: 'Problem, product, proof, call to action — fifteen seconds, no wasted frame.',
    duration: 15,
    aspectRatio: '9:16',
    tags: ['performance', 'cta', 'conversion'],
    gradient: ['#FF6B35', '#7C6BFF'],
    blueprint: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 3, accepts: 'video', label: 'Problem' },
            { kind: 'media', start: 3, duration: 5, accepts: 'video', label: 'Product', transitionIn: { type: 'zoom', duration: 0.3 } },
            { kind: 'media', start: 8, duration: 4, accepts: 'video', label: 'Proof', transitionIn: { type: 'dissolve', duration: 0.3 } },
            { kind: 'media', start: 12, duration: 3, accepts: 'image', label: 'End frame', transitionIn: { type: 'fade', duration: 0.3 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 0.2, duration: 2.6, content: 'Still doing it the hard way?', preset: 'heading', animation: 'slide-up' },
            { kind: 'text', start: 12.2, duration: 2.6, content: 'Try it free', preset: 'statement', animation: 'pop' },
          ],
        },
      ],
    },
  },
  {
    id: 'ad-brand-spot',
    name: 'Brand Spot',
    category: 'Ads',
    description: 'A wide, unhurried thirty-second spot that ends on the logo.',
    duration: 30,
    aspectRatio: '16:9',
    tags: ['brand', 'broadcast', 'wide'],
    gradient: ['#3D5AFE', '#0B1445'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 24,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 8, accepts: 'video', label: 'Open', transitionIn: { type: 'fade', duration: 1.2 }, effects: [{ type: 'color', presetId: 'color-cinematic' }] },
            { kind: 'media', start: 8, duration: 9, accepts: 'video', label: 'Middle', transitionIn: { type: 'dissolve', duration: 0.8 } },
            { kind: 'media', start: 17, duration: 8, accepts: 'video', label: 'Payoff', transitionIn: { type: 'dissolve', duration: 0.8 } },
            { kind: 'media', start: 25, duration: 5, accepts: 'image', label: 'Logo', transitionIn: { type: 'fade', duration: 1 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [{ kind: 'text', start: 25.6, duration: 3.8, content: 'BRAND', preset: 'statement', animation: 'blur-in' }],
        },
        { kind: 'audio', name: 'Music', volume: 0.45, clips: [{ kind: 'media', start: 0, duration: 30, accepts: 'audio', label: 'Score', volume: 0.45 }] },
      ],
    },
  },
  {
    id: 'corp-explainer',
    name: 'Corporate Explainer',
    category: 'Corporate',
    description: 'Lower thirds, clean captions and a neutral grade for internal or investor video.',
    duration: 40,
    aspectRatio: '16:9',
    tags: ['explainer', 'lower third', 'captions'],
    gradient: ['#5B7CFA', '#101F4D'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 20, accepts: 'video', label: 'Interview A', transitionIn: { type: 'fade', duration: 0.5 } },
            { kind: 'media', start: 20, duration: 20, accepts: 'video', label: 'Interview B', transitionIn: { type: 'dissolve', duration: 0.5 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 1.5, duration: 4, content: 'Name · Role', preset: 'lower-third', animation: 'slide-up' },
            { kind: 'text', start: 21.5, duration: 4, content: 'Name · Role', preset: 'lower-third', animation: 'slide-up' },
          ],
        },
        { kind: 'caption', name: 'Captions', clips: [] },
      ],
    },
  },
  {
    id: 'corp-quarterly',
    name: 'Quarterly Update',
    category: 'Corporate',
    description: 'Chaptered update with kickers between sections and space for screen recordings.',
    duration: 48,
    aspectRatio: '16:9',
    tags: ['update', 'chapters', 'screen recording'],
    gradient: ['#22C7A9', '#07332C'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 6, accepts: 'video', label: 'Intro' },
            { kind: 'media', start: 6, duration: 14, accepts: 'video', label: 'Chapter 1', transitionIn: { type: 'slide', duration: 0.4 } },
            { kind: 'media', start: 20, duration: 14, accepts: 'video', label: 'Chapter 2', transitionIn: { type: 'slide', duration: 0.4 } },
            { kind: 'media', start: 34, duration: 14, accepts: 'video', label: 'Chapter 3', transitionIn: { type: 'slide', duration: 0.4 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 6.2, duration: 3, content: 'CHAPTER ONE', preset: 'kicker', animation: 'blur-in' },
            { kind: 'text', start: 20.2, duration: 3, content: 'CHAPTER TWO', preset: 'kicker', animation: 'blur-in' },
            { kind: 'text', start: 34.2, duration: 3, content: 'CHAPTER THREE', preset: 'kicker', animation: 'blur-in' },
          ],
        },
      ],
    },
  },
  {
    id: 'cine-trailer',
    name: 'Cinematic Trailer',
    category: 'Cinematic',
    description: 'Black-frame beats, escalating cuts and a title that lands on the last hit.',
    duration: 36,
    aspectRatio: '16:9',
    tags: ['trailer', 'dramatic', 'grade'],
    gradient: ['#F5A623', '#2B1400'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 24,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 6, accepts: 'video', label: 'Establish', transitionIn: { type: 'fade', duration: 1.5 }, effects: [{ type: 'color', presetId: 'color-cinematic' }, { type: 'vignette', presetId: 'vignette-classic' }] },
            { kind: 'media', start: 6, duration: 5, accepts: 'video', label: 'Beat 1', transitionIn: { type: 'fade', duration: 0.4 } },
            { kind: 'media', start: 11, duration: 4, accepts: 'video', label: 'Beat 2', transitionIn: { type: 'fade', duration: 0.3 } },
            { kind: 'media', start: 15, duration: 3, accepts: 'video', label: 'Beat 3', transitionIn: { type: 'fade', duration: 0.25 } },
            { kind: 'media', start: 18, duration: 2, accepts: 'video', label: 'Beat 4', transitionIn: { type: 'fade', duration: 0.2 } },
            { kind: 'media', start: 20, duration: 10, accepts: 'video', label: 'Climax', transitionIn: { type: 'zoom', duration: 0.8 } },
            { kind: 'media', start: 30, duration: 6, accepts: 'image', label: 'Title card', transitionIn: { type: 'fade', duration: 1.2 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 2, duration: 3, content: 'THIS SUMMER', preset: 'kicker', animation: 'blur-in' },
            { kind: 'text', start: 30.5, duration: 5, content: 'TITLE', preset: 'statement', animation: 'blur-in' },
          ],
        },
        { kind: 'audio', name: 'Score', volume: 0.6, clips: [{ kind: 'media', start: 0, duration: 36, accepts: 'audio', label: 'Trailer score', volume: 0.6 }] },
      ],
    },
  },
  {
    id: 'cine-short',
    name: 'Short Film Open',
    category: 'Cinematic',
    description: '2.39:1 letterboxed opening with a slow fade and a single title.',
    duration: 24,
    aspectRatio: '16:9',
    tags: ['letterbox', 'slow', 'title'],
    gradient: ['#8E8E93', '#111113'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 24,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 12, accepts: 'video', label: 'Opening shot', transitionIn: { type: 'fade', duration: 2 }, effects: [{ type: 'color', presetId: 'color-cinematic' }, { type: 'grain', presetId: 'grain-fine' }] },
            { kind: 'media', start: 12, duration: 12, accepts: 'video', label: 'Second shot', transitionIn: { type: 'dissolve', duration: 1.4 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [{ kind: 'text', start: 14, duration: 5, content: 'A film by you', preset: 'quote', animation: 'fade' }],
        },
      ],
    },
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    category: 'Product',
    description: 'Macro detail shots, a spec beat and a price reveal on the end card.',
    duration: 22,
    aspectRatio: '16:9',
    tags: ['product', 'macro', 'reveal'],
    gradient: ['#00C2FF', '#052D3D'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 5, accepts: 'video', label: 'Reveal', transitionIn: { type: 'fade', duration: 0.6 }, effects: [{ type: 'glow', presetId: 'glow-bloom' }] },
            { kind: 'media', start: 5, duration: 5, accepts: 'video', label: 'Detail A', transitionIn: { type: 'dissolve', duration: 0.4 } },
            { kind: 'media', start: 10, duration: 5, accepts: 'video', label: 'Detail B', transitionIn: { type: 'dissolve', duration: 0.4 } },
            { kind: 'media', start: 15, duration: 7, accepts: 'video', label: 'In use', transitionIn: { type: 'zoom', duration: 0.5 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 0.6, duration: 3.6, content: 'Introducing', preset: 'kicker', animation: 'fade' },
            { kind: 'text', start: 17, duration: 4.4, content: 'Available now', preset: 'heading', animation: 'slide-up' },
          ],
        },
      ],
    },
  },
  {
    id: 'product-unbox',
    name: 'Unboxing',
    category: 'Product',
    description: 'Vertical unboxing beats with bold captions between each reveal.',
    duration: 20,
    aspectRatio: '9:16',
    tags: ['unboxing', 'vertical', 'captions'],
    gradient: ['#FF9E3D', '#4A2400'],
    blueprint: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 5, accepts: 'video', label: 'Box' },
            { kind: 'media', start: 5, duration: 5, accepts: 'video', label: 'Open', transitionIn: { type: 'slide', duration: 0.25 } },
            { kind: 'media', start: 10, duration: 5, accepts: 'video', label: 'Contents', transitionIn: { type: 'slide', duration: 0.25 } },
            { kind: 'media', start: 15, duration: 5, accepts: 'video', label: 'Verdict', transitionIn: { type: 'slide', duration: 0.25 } },
          ],
        },
        { kind: 'caption', name: 'Captions', clips: [] },
      ],
    },
  },
  {
    id: 'realestate-tour',
    name: 'Property Tour',
    category: 'Real Estate',
    description: 'Exterior, interior sequence and a details card with the listing information.',
    duration: 42,
    aspectRatio: '16:9',
    tags: ['property', 'tour', 'listing'],
    gradient: ['#C8A96A', '#2A2011'],
    blueprint: {
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 8, accepts: 'video', label: 'Exterior', transitionIn: { type: 'fade', duration: 1 }, effects: [{ type: 'color', presetId: 'color-warm' }] },
            { kind: 'media', start: 8, duration: 9, accepts: 'video', label: 'Living space', transitionIn: { type: 'dissolve', duration: 0.7 } },
            { kind: 'media', start: 17, duration: 9, accepts: 'video', label: 'Kitchen', transitionIn: { type: 'dissolve', duration: 0.7 } },
            { kind: 'media', start: 26, duration: 9, accepts: 'video', label: 'Bedroom', transitionIn: { type: 'dissolve', duration: 0.7 } },
            { kind: 'media', start: 35, duration: 7, accepts: 'image', label: 'Details card', transitionIn: { type: 'fade', duration: 0.8 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 1, duration: 4, content: '12 Example Street', preset: 'lower-third', animation: 'slide-up' },
            { kind: 'text', start: 35.5, duration: 6, content: 'Book a viewing', preset: 'heading', animation: 'fade' },
          ],
        },
        { kind: 'audio', name: 'Music', volume: 0.4, clips: [{ kind: 'media', start: 0, duration: 42, accepts: 'audio', label: 'Music bed', volume: 0.4 }] },
      ],
    },
  },
  {
    id: 'realestate-reel',
    name: 'Listing Reel',
    category: 'Real Estate',
    description: 'Fast vertical walkthrough for social, with price and location on screen.',
    duration: 15,
    aspectRatio: '9:16',
    tags: ['listing', 'vertical', 'fast'],
    gradient: ['#9BE15D', '#123B0C'],
    blueprint: {
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 3, accepts: 'video', label: 'Front' },
            { kind: 'media', start: 3, duration: 3, accepts: 'video', label: 'Hall', transitionIn: { type: 'slide', duration: 0.2 } },
            { kind: 'media', start: 6, duration: 3, accepts: 'video', label: 'Living', transitionIn: { type: 'slide', duration: 0.2 } },
            { kind: 'media', start: 9, duration: 3, accepts: 'video', label: 'Kitchen', transitionIn: { type: 'slide', duration: 0.2 } },
            { kind: 'media', start: 12, duration: 3, accepts: 'video', label: 'Garden', transitionIn: { type: 'slide', duration: 0.2 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [{ kind: 'text', start: 11.5, duration: 3.4, content: '£000,000', preset: 'statement', animation: 'pop' }],
        },
      ],
    },
  },
  {
    id: 'social-quote',
    name: 'Quote Card',
    category: 'Social Media',
    description: 'A 4:5 quote post with a slow push and a single line of type.',
    duration: 10,
    aspectRatio: '4:5',
    tags: ['quote', 'portrait', 'simple'],
    gradient: ['#B06BFF', '#2A0F4A'],
    blueprint: {
      aspectRatio: '4:5',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 10, accepts: 'video', label: 'Background', transitionIn: { type: 'zoom', duration: 2 }, effects: [{ type: 'blur', presetId: 'blur-soft' }, { type: 'vignette', presetId: 'vignette-classic' }] },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [{ kind: 'text', start: 0.8, duration: 8.4, content: '“Write the line that earns the pause.”', preset: 'quote', animation: 'fade' }],
        },
      ],
    },
  },
  {
    id: 'social-announcement',
    name: 'Announcement',
    category: 'Social Media',
    description: 'A short square post for launches, events and news, ending on a date.',
    duration: 12,
    aspectRatio: '1:1',
    tags: ['announcement', 'square', 'event'],
    gradient: ['#FF5C7C', '#4A0A1C'],
    blueprint: {
      aspectRatio: '1:1',
      resolution: '1080p',
      fps: 30,
      tracks: [
        {
          kind: 'video',
          name: 'Video',
          clips: [
            { kind: 'media', start: 0, duration: 7, accepts: 'video', label: 'Context' },
            { kind: 'media', start: 7, duration: 5, accepts: 'image', label: 'Date card', transitionIn: { type: 'dissolve', duration: 0.5 } },
          ],
        },
        {
          kind: 'text',
          name: 'Text',
          clips: [
            { kind: 'text', start: 0.5, duration: 5.5, content: "It's happening", preset: 'heading', animation: 'pop' },
            { kind: 'text', start: 7.4, duration: 4.2, content: 'SAVE THE DATE', preset: 'kicker', animation: 'blur-in' },
          ],
        },
      ],
    },
  },
]

export const TEMPLATE_CATEGORIES = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Ads',
  'Corporate',
  'Cinematic',
  'Product',
  'Real Estate',
  'Social Media',
] as const

export const getTemplate = (id: string) => TEMPLATES.find((t) => t.id === id)
