# CodePic for VS Code

Open the code you select in [CodePic](https://codepic.kitdev.space/) and turn it into an image.

This extension is not on the Marketplace yet. To try it, follow the steps in the "From VS Code" section of the main README.

## Use

1. Select code in the editor. With no selection, the whole file is sent. With more than one selection, only the first one is sent.
2. Right-click and choose **Open in CodePic**, or run **CodePic: Open in CodePic** from the Command Palette.

CodePic opens in your browser with the code, the language and the file name filled in. The language and the file name replace the ones you saved in CodePic. Your other saved settings stay as they are.

## Privacy

The code goes in the part of the link after `#`. The browser never sends that part to a server, and CodePic reads it on your machine. The language and the file name go in the part before `#`, so the CodePic site can see them.

## Limits

- Code that is too long for a link gives an error. Select a smaller part of the code.
- In the file name, `%`, `&`, `+`, `#`, `=` and `?` become `_`, because VS Code changes these characters in a link. A name longer than 200 characters is cut.
- For a language that CodePic does not know, the extension finds the language from the code.
- The extension does not work in VS Code for the Web.
