import "./style.css";
import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/adventurer";
import * as htmlToImage from "html-to-image";
import toastr from "toastr";

//default variables
var content = "Share your avatar with funny insult";
var url = "https://insultavatar.ml";
var title = "Insult Avatar";

var author = [
  "ansari",
  "thameem",
  "thaha thameem ansari",
  "therobinhood",
  "thaha",
];

var male = () => {
  var num = Math.floor(Math.random() * 16);
  if (Number(num) === 0) {
    num = 1;
  }
  return "short" + ("0" + num).slice(-2);
};

var female = () => {
  var num = Math.floor(Math.random() * 20);
  if (Number(num) === 0) {
    num = 1;
  }
  return "long" + ("0" + num).slice(-2);
};

//toastr settings
toastr.options.progressBar = true;
toastr.options.positionClass = "toast-bottom-center";
toastr.options.timeOut = 3000;
toastr.options.tapToDismiss = true;
toastr.options.showMethod = "slideDown";

// fetches insult from api
async function getInsult() {
  const response = await fetch(
    "https://insultavatar.ml/insults.json"
  );
  const insult = await response.json();
  return insult.insults[Math.floor(Math.random() * insult.insults.length)];
}

async function shareFunction() {
  var dataUrl = await htmlToImage.toPng(document.getElementById("app"));
  const blob = await (await fetch(dataUrl)).blob();
  const filesArray = [
    new File([blob], "InsultAvatar.png", {
      type: blob.type,
      lastModified: new Date().getTime(),
    }),
  ];
  const toShare = {
    title: title,
    text: content,
    url: url,
    files: filesArray,
  };

  if (navigator.share && navigator.userAgentData.mobile) {
    try {
      await navigator.share(toShare);
      toastr.success("Successfully shared");
    } catch (err) {
      console.log(err);
    }
  } else {
    const textBlob = new Blob([`${content}\n\n${url}`], {
      type: "text/plain",
    });
    navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob, "text/plain": textBlob }),
    ]);
    toastr.success("Copied to clipboard");
  }
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

async function avatarGenerator(e) {
  if (e.target.value.length > 2) {
    if (document.getElementById("avatar").innerHTML === "") {
      document.getElementById(
        "avatar"
      ).innerHTML = `<div class="loader"></div>`;
    }
    var givenName = e.target.value.toLowerCase().trim();
    var fetchedData = await fetch(
      "https://api.genderize.io/?name=" + givenName.split(" ")[0]
    );
    var data = await fetchedData.json();
    var hair = data.gender === "male" ? male() : female();
    const avatar = createAvatar(style, {
      seed: givenName,
      size: 200,
      scale: 90,
      radius: 50,
      hair: [hair],
      accessoiresProbability:15
    });
    if (e.target.value.length > 2) {
      document.getElementById("avatar").innerHTML = avatar;
    }
  } else {
    document.getElementById("avatar").innerHTML = "";
  }

  //Creators benifit
  if (author.includes(e.target.value.toLowerCase().trim())) {
    return (document.getElementById("avatar").innerHTML = createAvatar(style, {
      size: 200,
      scale: 90,
      radius: 50,
      hair: ["short16"],
      mouth: ["variant20"],
      eyebrows: ["variant02"],
      skinColor: ["variant03"],
      hairColor: ["black"],
      eyes: ["variant20"],
      accessoires: ["glasses"],
      accessoiresProbability: 100,
    }));
  }
}

//localStorage Settings and check function
function checkthestorage(name) {
  var list = JSON.parse(localStorage.getItem("InsultAvatar"));
  if (list !== null) {
    if (list.expire !== new Date().toISOString().slice(0, 10)) {
      localStorage.removeItem("InsultAvatar");
      localStorage.setItem(
        "InsultAvatar",
        JSON.stringify({
          expire: new Date().toISOString().slice(0, 10),
          avatar: [name],
        })
      );
      return false;
    }
    if (list.avatar.includes(name)) {
      return true;
    } else {
      list.avatar.push(name);
      localStorage.setItem("InsultAvatar", JSON.stringify(list));
      return false;
    }
  } else {
    localStorage.setItem(
      "InsultAvatar",
      JSON.stringify({
        expire: new Date().toISOString().slice(0, 10),
        avatar: [name],
      })
    );
    return false;
  }
}

//Fetched Insult from API displayed on page
function insultButtonAction() {
  if (document.getElementById("text").value.length <= 2) {
    return toastr.error("Please enter a valid name");
  }
  var name = document.getElementById("text").value;
  if (!/^[a-zA-Z ]+$/.test(name)) {
    return toastr.warning("Please enter a valid name");
  }

  if (author.includes(name.toLowerCase())) {
    return toastr.info("Sorry mate couldn't insult the creator");
  }

  document.getElementById("head").innerHTML = name;
  document.getElementById("form").innerHTML = `<div class="loader"></div>`;
  document.getElementsByClassName("reload")[0].style.display = "block";
  document.getElementsByClassName("logo")[0].style.display = "block";
  document.getElementsByClassName("download")[0].style.display = "block";

  if (!checkthestorage(name.toLowerCase())) {
    getInsult().then((insult) => {
      document.getElementById("form").innerHTML = `<h3>${insult}</h3>`;
      document.getElementById("share").style.display = "inline-block";
    });
  } else {
    document.getElementById(
      "form"
    ).innerHTML = `<h3>How many times in a day should i insult you ?</h3>`;
    document.getElementById("share").style.display = "inline-block";
  }
}

async function downloadImage() {
  var dataUrl = await htmlToImage.toPng(document.getElementById("app"));
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "InsultAvatar.png";
  link.click();
}

//insult Button Action
document.getElementById("insult").addEventListener("click", insultButtonAction);
//generate avatar
document
  .getElementById("text")
  .addEventListener("input", debounce(avatarGenerator, 250));

//Enter key action
document.getElementById("text").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    var value = document.getElementById("text").value;
    if (value.length > 0) {
      document.getElementById("insult").click();
    }
  }
});

//share Button actions
const shareButton = document.getElementById("share");
shareButton.addEventListener("click", shareFunction);

//download Button actions
const downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", downloadImage);
