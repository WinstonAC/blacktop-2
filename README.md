# Blacktop Basketball Registration Form

A responsive, printer-friendly registration form for Blacktop Basketball with email submission functionality.

## Features

- ✅ **Single HTML file** - Self-contained with inline CSS and JavaScript
- ✅ **Mobile responsive** - Works perfectly on iPhone and Android
- ✅ **Printer-friendly** - Clean print styles for email formatting
- ✅ **Email integration** - Sends to robertjanice@bellsouth.net via mailto
- ✅ **Form validation** - Required field checking and error handling
- ✅ **Auto-calculations** - Age calculation from date of birth
- ✅ **Conditional fields** - Shows/hides fields based on selections

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/WinstonAC/blacktop-2.git
   cd blacktop-2
   ```

2. **Open locally**
   - Simply open `index.html` in your web browser
   - No server required - it's a static HTML file

## GitHub Pages Deployment

### Method 1: Using GitHub Web Interface

1. **Create a new repository on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `blacktop-2` (or your preferred name)
   - Make it public
   - Don't initialize with README (we already have one)

2. **Upload files**
   - Click "uploading an existing file"
   - Drag and drop `index.html` and `README.md`
   - Commit with message "Initial commit"

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll down to "Pages" section
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
   - Click Save

4. **Access your form**
   - Your form will be live at: `https://WinstonAC.github.io/blacktop-2/`
   - GitHub will show the URL in the Pages section

### Method 2: Using Git Commands

1. **Initialize Git repository**
   ```bash
   git init
   ```

2. **Add files and commit**
   ```bash
   git add .
   git commit -m "first commit"
   ```

3. **Set up remote and push**
   ```bash
   git branch -M main
   git remote add origin https://github.com/WinstonAC/blacktop-2.git
   git push -u origin main
   ```

4. **Enable GitHub Pages** (same as Method 1, step 3)

## Form Usage

1. **Fill out the form** with all required information
2. **Click "Submit Registration"** to open your email client
3. **Send the email** to robertjanice@bellsouth.net
4. **Email is pre-formatted** with all form data in a clean, printable format

## Technical Details

- **No backend required** - Pure HTML, CSS, and JavaScript
- **Mobile-first design** - Responsive breakpoints at 768px and 480px
- **Print optimization** - Enhanced CSS for clean email printing
- **Form validation** - Client-side validation with visual feedback
- **Email formatting** - Uses separators and proper spacing for readability

## Browser Support

- ✅ Chrome (recommended)
- ✅ Safari
- ✅ Firefox
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## File Structure

```
blacktop-2/
├── index.html          # Main form file (self-contained)
├── README.md           # This file
└── .gitignore          # Git ignore file (optional)
```

## Customization

To modify the form:
1. Edit `index.html` directly
2. All CSS is in the `<style>` section
3. All JavaScript is in the `<script>` section
4. No external dependencies

## Support

For issues or questions, please contact the development team or create an issue in the repository.

---

**Last Updated:** September 2024  
**Version:** 1.0.0
