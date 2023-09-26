 // getting Elements from Dom 
  const joinButton = document.querySelector("button");
  const videoContainer = document.getElementById("videoContainer");
  const textDiv = document.getElementById("textDiv");
  const signin = document.getElementById("signin");
  const videoButton = document.getElementById("video-button");
  const shareButton = document.getElementById("share-button");
  const endButton = document.getElementById("end-button");
  
  // decalare Variables
  let participants = [];
  let meeting = null;
  let localParticipant;
  let localParticipantAudio;
  let remoteParticipantId = "";
 
 joinButton.addEventListener("click", () => {
   signin.style.display = "none";
   joinButton.style.display = "none";
   textDiv.textContent = "Hold On, while we connect you";
 
   const userMeetingId = meetingIdInput.value.trim(); // Get the entered meeting ID

   // Ensure the user has entered a valid meeting ID (you can add further validation)
   if (userMeetingId) {
       window.VideoSDK.config("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJkZDM2YjRhZC0zZjliLTRlODgtYTVkZS1iZDA4NTY0MjdjNWUiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY5NTIwNzQ0MCwiZXhwIjoxODUyOTk1NDQwfQ.h8ibspI-t7a6VinPPVob4NFOMg05HUFh1YrOwudkG8w"); // Replace with your API key
       meeting = window.VideoSDK.initMeeting({
           meetingId: userMeetingId, // Use the user-entered meeting ID
           name: "Samson's Org", // You can customize this as needed
           maxResolution: "hd",
           micEnabled: true,
           webcamEnabled: true,
       });

       // Create audio element for local participant
       localParticipantAudio = createAudioElement(meeting.localParticipant.id);
       videoContainer.appendChild(localParticipantAudio);

       meeting.join();
       meeting.on("meeting-joined", () => {
        textDiv.textContent = "No user Joined";
    });
   } else {
       // Handle the case where no meeting ID is entered
       textDiv.textContent = "Please enter a valid Meeting ID.";
   }
})

  

// Create video element with inline style
// Create video element with inline style
function createVideoElement(pId) {
  const videoElement = document.createElement("video");
  videoElement.classList.add("video-frame");
  videoElement.setAttribute("id", `v-${pId}`);
  videoElement.setAttribute("playsinline", true);

  if (pId === meeting.localParticipant.id) {
    // Apply style for the local participant's video frame
    videoElement.style.position = "absolute";
    videoElement.style.top = "10px";
    videoElement.style.right = "10px";
    videoElement.style.width = "85px"; // Adjust the size as needed
    videoElement.style.height = "70px";
    videoElement.style.border = "2px solid blue";
    videoElement.style.overflow = "hidden";
    videoElement.style.borderRadius = "10px";
    videoElement.style.backgroundSize = "cover";

  } else {
    // No need to set styles for remote participants' video frames here
  }
  
  return videoElement;
}

// ...

  
  // creating audio element
  function createAudioElement(pId) {
    let audioElement = document.createElement("audio");
    audioElement.setAttribute("autoPlay", "false");
    audioElement.setAttribute("playsInline", "true");
    audioElement.setAttribute("controls", "false");
    audioElement.setAttribute("id", `a-${pId}`);
    return audioElement;
  }
  
  // creating local participant
  function createLocalParticipant() {
    localParticipant = createVideoElement(meeting.localParticipant.id);
    videoContainer.appendChild(localParticipant);
  }
  
  // setting media track
  function setTrack(stream, audioElement, participant, isLocal) {
    if (stream.kind == "video") {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(stream.track);
      let videoElm = document.getElementById(`v-${participant.id}`);
      videoElm.srcObject = mediaStream;
      videoElm
        .play()
        .catch((error) =>
          console.error("videoElem.current.play() failed", error)
        );
    }
    if (stream.kind == "audio" && !isLocal) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(stream.track);
      audioElement.srcObject = mediaStream;
      audioElement
        .play()
        .catch((error) => console.error("audioElem.play() failed", error));
    }
  }


  joinButton.addEventListener("click", () => {
    // ...
    // ...
    // ...
    
    // creating local participant
      createLocalParticipant();
    
    // setting local participant stream
      meeting.localParticipant.on("stream-enabled", (stream) => {
        setTrack(
          stream,
          localParticipantAudio,
          meeting.localParticipant,
          (isLocal = true)
        );
      });
      
      meeting.on("meeting-joined", () => {
        textDiv.style.display = "none";
      });
    
      // other participants
      
      meeting.on("participant-joined", (participant) => {
        let videoElement = createVideoElement(participant.id);
        let audioElement = createAudioElement(participant.id);
        remoteParticipantId = participant.id;
    
        participant.on("stream-enabled", (stream) => {
          setTrack(stream, audioElement, participant, (isLocal = false));
        });
        videoContainer.appendChild(videoElement);
        videoContainer.appendChild(audioElement);
      });
    
      // participants left
      meeting.on("participant-left", (participant) => {
        let vElement = document.getElementById(`v-${participant.id}`);
        vElement.parentNode.removeChild(vElement);
    
        let aElement = document.getElementById(`a-${participant.id}`);
        aElement.parentNode.removeChild(aElement);
        //remove it from participant list participantId;
        document.getElementById(`p-${participant.id}`).remove();
      });
    });