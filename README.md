# Real-Time Chair Removal - Chair removal from complex backgrounds in real time

Removing chairs from complex backgrounds in real time using TensorFlow.js, Teachable Machine, and the web browser using JavaScript.

This is a modified version of the original [Real-Time-Person-Removal](https://github.com/jasonmayes/Real-Time-Person-Removal) project by Jason Mayes, adapted to detect and remove **chairs** instead of people using Google's Teachable Machine.

## What can this do?

This code uses a custom trained Teachable Machine model to detect chairs in your webcam feed in real time. The browser learns the background over time and replaces detected chairs with the learned background.

All processing happens in real time, in the browser, using TensorFlow.js and runs entirely client-side (no server required).

## How to Use

1. Open `index.html` in your web browser
2. Wait for the model to load (you'll see the webcam demo section appear)
3. Click "Enable Webcam" to start detection
4. Place chairs in front of your webcam and watch them disappear!

## How to Train Your Own Model

1. Go to [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Create a new "Image Project"
3. Rename the classes:
   - **Class 1**: "Chair"
   - **Class 2**: "Background"
4. Collect training images (50-100 per class recommended):
   - **Chair class**: Photos with chairs in various angles and lighting
   - **Background class**: Photos without chairs (empty rooms, desks, etc.)
5. Train the model
6. Export as TensorFlow.js
7. Update the `URL` constant in `script.js` with your new model URL

## Technical Details

- **Model Type**: Custom image classification model trained with Google Teachable Machine
- **Libraries**: TensorFlow.js, Teachable Machine Image library
- **Language**: JavaScript
- **Runtime**: Browser-based (no backend server required)
- **Detection Method**: Real-time frame-by-frame classification with background learning

## Files

- `index.html` - Main webpage
- `script.js` - Core detection and background learning logic
- `style.css` - Styling
- `README.md` - This file

## License

Based on the original project by Jason Mayes which is released under the Apache License 2.0.

## Credits

- Original project: [jasonmayes/Real-Time-Person-Removal](https://github.com/jasonmayes/Real-Time-Person-Removal)
- Modified for chair detection using [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
- Built with [TensorFlow.js](https://www.tensorflow.org/js)

---

**Note**: This is an experimental project. Results may vary depending on lighting, camera angle, and chair appearance in your training data.