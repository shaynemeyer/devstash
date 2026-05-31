# Code Editor Spec

## Overview

Add Monaco Editor component for snippets and commands with copy button and macOS window styling.

## Requirements

- Create CodeEditor component using Monaco Editor with dark theme
- Replace Textarea with CodeEditor for snippets and commands only
- Keep Textarea for notes, prompts, and other non-code types
- Add macOS-style window dots (red/yellow/green) at top of editor
- Add quick copy button in editor header
- Add the language in editor header next to copy
- Support both display (readonly) and edit modes
- Make the height of the editor fluid but a max height of 400px and add a nice looking scrollbar that matches the theme
- New item button in the top bar should default to snippet
- Add a type specific add button on each type page and preselect the type in the new item dialog
