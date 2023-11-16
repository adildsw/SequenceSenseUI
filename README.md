<p align='center'>
<img width='60%' src='https://github.com/adildsw/SequenceSenseUI/blob/main/src/assets/sequence-sense-banner.svg'>
</p>

__SequenceSense__ is a gesture sequencing tool. Gesture designers can use SequenceSense to construct robust gestures by sequencing atomic actions as gesture building blocks and comparing it against a regular activity corpus. Once a gesture is constructed, SequenceSense helps designers reduce the overall false activation of their gesure set by visualizing the performance of each gesture independently.

## Getting Started
The following set of instructions will help you get SequenceSense up and running on your computer.

### Prerequisites
In order to build and run this application on your device, make sure you meet the following prerequisites:
##### 1. Install [Node.js](https://nodejs.org/en/)
##### 2. Install Python 3.6+ ([Anaconda](https://www.anaconda.com/download/) distribution recommended)

### Building SequenceSense
Once all the prerequisites are met, follow these instructions to build and execute SequenceSense on your device:

#### 1. Clone SequenceSense repository to your local system. 
Open the <i>Terminal</i> window and type the following command:
```
git clone https://github.com/adildsw/SequenceSenseUI
```
#### 2. Navigate to the directory containing SequenceSense
```
cd SequenceSenseUI
```
#### 3. Install Node.js dependencies
```
npm install
```
#### 4. Install Python dependencies
```
pip install -r requirements.txt
```
#### 5. Starting Backend Server
Once all the dependencies are installed, you need to start the backend server using the following command in the terminal:
```
cd backend
python server.py
```
#### 6. Launching SequenceSense
Once the backend server is running, you can launch the SequenceSense UI by navigating to the root SequenceSense directory and using the following command in the terminal: 
```
npm start
```
Once the server is hosted successfully, SequenceSense should load automatically in your default browser.
<img src='https://github.com/adildsw/SequenceSenseUI/blob/main/src/assets/screen_3.png'>

## Citation
```
@article{AZIM2023103035,
  title = {SequenceSense: A Tool for Designing Usable Foot-Based Gestures Using a Sequence-Based Gesture Recognizer},
  journal = {International Journal of Human-Computer Studies},
  volume = {176},
  pages = {103035},
  year = {2023},
  issn = {1071-5819},
  doi = {https://doi.org/10.1016/j.ijhcs.2023.103035},
  url = {https://www.sciencedirect.com/science/article/pii/S1071581923000447},
  author = {Md Aashikur Rahman Azim and Adil Rahman and Seongkook Heo},
  keywords = {Foot-based gestures, Gesture recognizer, Usable gestures, Gesture designer},
}
```
