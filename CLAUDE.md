# Claude Development Notes

## Icon Creation Commands

### Converting SVG to Transparent PNG
To create a properly transparent PNG icon from SVG (without white background):

```bash
# Step 1: Convert SVG to PNG with transparent background
mogrify -background none -format png app-icon-no-bg.svg

# Step 2: Resize the PNG to desired size
convert app-icon-no-bg.png -resize 256x256 app-icon-no-bg-256.png

# Step 3: Copy to distribution directory
cp app-icon-no-bg-256.png /workspace/dist/app-icon-transparent.png
```

**Note**: The `mogrify -background none -format png` command is the key to getting true transparency without white background artifacts that other ImageMagick commands produce.

## Project Commands

### Build Commands
- `npm run build-electron` - Build the Electron main process
- `npm run build-react` - Build the React frontend  
- `npm run build-all` - Build both Electron and React
- `npm run dev-electron` - Run in development mode

### Testing
- No tests currently configured (`npm test` returns placeholder)
- No linting currently configured (`npm run lint` returns placeholder)