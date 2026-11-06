# Additional project answers

These answers describe the build. Participant and survey selections remain the submitter's own answers in Devpost.

## Public code repository

https://github.com/Abhinav0905/two-minutes

## Main technology requirement

I used the Devpost Learn plan-lens skill to plan the experience and write the design brief in the devpost folder. CLAD and the Lens Studio MCP were used to build and check the native SPECS Lens in Lens Studio 5.23.2. SIK handles targeting, pinching and moving the lid. UIKit supplies the panels and buttons. MeshBuilder creates the kitchen props, flames and exit. The Lens runs in Lens Studio Preview. The public repository includes the Lens Studio project, packages, source, tests and planning documents. The GitHub Pages site lets reviewers try the same decision rules in a browser and watch the native Lens video.

## Where I got stuck

The hardest part was getting the scene to respond to Preview input. Some testing packages expected different SIK and UIKit import names, so the first package combination would not compile. A hidden panel also blocked input, and finishing a lid drag could record the same action twice. I used compatible package versions, disabled the whole hidden panel and added a check to prevent the duplicate lid action. I then checked the flows again in Preview. All seven native test cases passed.

## One thing Snap could fix

Add a package compatibility check before CLAD imports the testing tools. It should check the Lens Studio, SIK, UIKit and Preview Agent versions, then explain which versions work together. A clear message at that point would save the time spent fixing import-name errors later.
