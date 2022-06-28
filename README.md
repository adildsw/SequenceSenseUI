<p align='center'>
<img width='60%' src='https://github.com/adildsw/SequenceSenseUI/blob/main/src/assets/sequence-sense-banner.svg'>
</p>

__SequenceSense__ is a gesture sequencing tool. Gesture designers can use SequenceSense to construct robust gestures using atomic actions as gesture building blocks and compare it against regular activity corpus. Once a gesture is constructed, SequenceSense helps designers reduce the overall false activation of their gesure set by visualizing the performance of each gesture independently.

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
<img src='https://github.com/adildsw/SequenceSenseUI/blob/main/src/assets/screen_1.png'>

