function SoftToPos(token, options) {
    var myToken = token;
    var mainUrl = "https://api.softtopos.be";
    var defaults = {
        // your default options here
    };

    var settings = Object.assign({}, defaults, options);
    var uuid = "";
    var stop = false;
    var fail_url = "";
    var success_url = "";
    var try_count = 0;
    var site_font = "";
    var payment_text = settings.payment_text;
    var payment_pending_text = settings.payment_pending_text;
    var payment_success_text = settings.payment_success_text;
    var payment_failed_text = settings.payment_failed_text;
    var loader_color = settings.loader_color;

    if (settings.success_url && settings.fail_url) {
        fail_url = settings.fail_url;
        success_url = settings.success_url;
    }

    var dynamicPayBtn = document.querySelector(`#${settings.btn_id}`);
    if (dynamicPayBtn) {

        if (dynamicPayBtn.dataset.successUrl && dynamicPayBtn.dataset.failUrl) {
            fail_url = dynamicPayBtn.dataset.failUrl;
            success_url = dynamicPayBtn.dataset.successUrl;
        }
    }

    async function displayQRCode() {
        var loading = document.querySelector("#warpQrLoaderDiv");
        loading.style.display = "block";

        var qrImg = document.querySelector("#qr-image");
        qrImg.src = "";
        var chatBox = document.querySelector("#qr-box");
        chatBox.style.display = "block";
        var res = await callConnectApi();
        qrImg.src = res.qr;

        loading.style.display = "none";
    }

    function mainView() {
        var body = document.body;
        site_font = window.getComputedStyle(body).fontFamily;

        var mainDiv = document.createElement("div");
        mainDiv.id = "connect_view";
        mainDiv.style.fontFamily = site_font;

        createFullLoader();
        createNewFloatingView(mainDiv);
        createCloseFloatingBtn(mainDiv);

        document.body.appendChild(mainDiv);
    }

    function createFullLoader() {
        var overlatDiv = document.createElement("div");
        overlatDiv.id = "overlatDiv";
        overlatDiv.style.position = "fixed";
        overlatDiv.style.top = "0";
        overlatDiv.style.left = "0";
        overlatDiv.style.width = "100%";
        overlatDiv.style.height = "100%";
        overlatDiv.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        overlatDiv.style.zIndex = "999";
        overlatDiv.style.display = "none";

        var loaderDiv = document.createElement("div");
        loaderDiv.id = "loaderDiv";
        loaderDiv.style.width = "48px";
        loaderDiv.style.height = "48px";
        loaderDiv.style.border = "5px solid #FFF";
        loaderDiv.style.borderBottomColor = "#0c9";
        loaderDiv.style.borderRadius = "50%";
        loaderDiv.style.display = "inline-block";
        loaderDiv.style.boxSizing = "border-box";
        loaderDiv.style.animation = "rotation 1s linear infinite";
        loaderDiv.style.top = "0";
        loaderDiv.style.left = "0";
        loaderDiv.style.bottom = "0";
        loaderDiv.style.right = "0";
        loaderDiv.style.position = "fixed";
        loaderDiv.style.margin = "auto";
        overlatDiv.appendChild(loaderDiv);

        var style = document.createElement("style");
        style.innerHTML =
            "@keyframes rotation {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}";
        document.head.appendChild(style);

        document.body.appendChild(overlatDiv);
    }

    function createNewFloatingView(mainDiv) {
        // floating buuton
        var circleDiv = document.createElement("div");
        circleDiv.id = "chat-circle";
        circleDiv.style.position = "fixed";
        circleDiv.style.bottom = "50px";
        circleDiv.style.right = "50px";
        circleDiv.style.background = settings.connect_btn_color;
        circleDiv.style.width = "25px";
        circleDiv.style.height = "25px";
        circleDiv.style.borderRadius = "50%";
        circleDiv.style.color = "white";
        circleDiv.style.padding = "28px";
        circleDiv.style.cursor = "pointer";
        circleDiv.style.zIndex = "9999";
        circleDiv.style.boxSizing = "unset";
        circleDiv.style.boxShadow =
            "0px 3px 16px 0px rgba(0, 0, 0, 0.6), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)";
        mainDiv.appendChild(circleDiv);

        var logoIcon = document.createElement("img");
        logoIcon.id = "qr-logoIcon";
        logoIcon.src = "https://ik.imagekit.io/softToPos/qr.svg";
        logoIcon.setAttribute("width", "100%");
        circleDiv.appendChild(logoIcon);

        var overLayDiv = document.createElement("div");
        overLayDiv.id = "chat-overlay";
        overLayDiv.style.background = "rgba(255, 255, 255, 0.1)";
        overLayDiv.style.position = "absolute";
        overLayDiv.style.top = "0";
        overLayDiv.style.left = "0";
        overLayDiv.style.width = "100%";
        overLayDiv.style.height = "100%";
        overLayDiv.style.borderRadius = "50%";
        overLayDiv.style.display = "none";
        circleDiv.appendChild(overLayDiv);

        // view box
        var qrBox = document.createElement("div");
        qrBox.id = "qr-box";
        qrBox.style.display = "none";
        qrBox.style.background = "#efefef";
        qrBox.style.right = "30px";
        qrBox.style.bottom = "38px";
        qrBox.style.width = "250px";
        qrBox.style.maxWidth = "85vw";
        qrBox.style.maxHeight = "100vh";
        qrBox.style.borderRadius = "5px";
        qrBox.style.position = "fixed";
        qrBox.style.border = "1px solid rgb(204, 204, 204)";
        qrBox.style.zIndex = "9999";
        mainDiv.appendChild(qrBox);

        // view header
        var qrBoxHeader = document.createElement("div");
        qrBoxHeader.id = "qr-header-box";
        qrBoxHeader.style.display = "flex";
        qrBoxHeader.style.justifyContent = "space-between";
        qrBoxHeader.style.background = "white";
        qrBoxHeader.style.height = "24px";
        qrBoxHeader.style.borderTopLeftRadius = "5px";
        qrBoxHeader.style.borderTopRightRadius = "5px";
        qrBoxHeader.style.color = "#80808099";
        qrBoxHeader.style.textAlign = "center";
        qrBoxHeader.style.fontSize = "18px";
        qrBoxHeader.style.fontWeight = "bolder";
        qrBoxHeader.style.paddingTop = "10px";
        qrBoxHeader.style.paddingBottom = "10px";
        qrBoxHeader.style.paddingLeft = "15px";
        qrBoxHeader.style.boxSizing = "unset";
        // qrBoxHeader.style.fontFamily = "sans-serif";
        qrBox.appendChild(qrBoxHeader);

        var titleSpan = document.createElement("span");
        titleSpan.id = "qr-box-title";
        titleSpan.innerText = "Connect to SoftToPos";
        // titleSpan.fontFamily = "sans-serif";
        titleSpan.fontWeight = "bolder";
        titleSpan.fontSize = "18px";
        titleSpan.color = "grey";
        qrBoxHeader.appendChild(titleSpan);

        var closeImage = document.createElement("img");
        closeImage.id = "qr-box-toggle";
        closeImage.src = "https://ik.imagekit.io/softToPos/close.svg";
        closeImage.setAttribute("width", "5%");
        closeImage.setAttribute("height", "auto");
        closeImage.style.cursor = "pointer";
        closeImage.style.float = "right";
        closeImage.style.marginRight = "15px";
        qrBoxHeader.appendChild(closeImage);

        // view box body
        var qrBoxBody = document.createElement("div");
        qrBoxBody.id = "qr-box-body";
        qrBoxBody.style.position = "relative";
        qrBoxBody.style.height = "370px";
        qrBoxBody.style.height = "auto";
        // qrBoxBody.style.border = "1px solid #ccc";
        qrBoxBody.style.overflow = "hidden";
        qrBoxBody.style.backgroundColor = "white";
        qrBox.appendChild(qrBoxBody);

        var qrBoxLog = document.createElement("div");
        qrBoxLog.id = "qr-box-log";
        qrBoxLog.style.padding = "15px";
        qrBoxLog.style.height = "223px";
        qrBoxLog.style.boxSizing = "unset";
        qrBoxBody.appendChild(qrBoxLog);

        var qrImage = document.createElement("img");
        qrImage.id = "qr-image";
        qrImage.src = "";
        qrImage.setAttribute("width", "100%");
        qrBoxLog.appendChild(qrImage);

        // loader
        var warpQrLoaderDiv = document.createElement("div");
        warpQrLoaderDiv.id = "warpQrLoaderDiv";
        warpQrLoaderDiv.style.display = "flex";
        warpQrLoaderDiv.style.justifyContent = "center";
        // warpQrLoaderDiv.style.padding = "133px";
        warpQrLoaderDiv.style.top = "99px";
        warpQrLoaderDiv.style.left = "102px";
        warpQrLoaderDiv.style.position = "absolute";
        warpQrLoaderDiv.style.backgroundColor = "rgb(128 128 128 / 2%)";
        var loaderQrDiv = document.createElement("div");
        loaderQrDiv.id = "loaderQrDiv";
        loaderQrDiv.style.width = "48px";
        loaderQrDiv.style.height = "48px";
        loaderQrDiv.style.border = "5px solid #FFF";
        loaderQrDiv.style.borderBottomColor = loader_color;
        loaderQrDiv.style.borderRadius = "50%";
        loaderQrDiv.style.display = "inline-block";
        loaderQrDiv.style.boxSizing = "border-box";
        loaderQrDiv.style.animation = "rotation 1s linear infinite";
        warpQrLoaderDiv.appendChild(loaderQrDiv);
        qrBoxLog.appendChild(warpQrLoaderDiv);
    }

    function createCloseFloatingBtn(mainDiv) {
        // floating buuton
        var closeCircleDiv = document.createElement("div");
        closeCircleDiv.id = "close-circle";
        closeCircleDiv.style.position = "fixed";
        closeCircleDiv.style.bottom = "50px";
        closeCircleDiv.style.right = "156px";
        closeCircleDiv.style.background = "red";
        closeCircleDiv.style.width = "25px";
        closeCircleDiv.style.height = "25px";
        closeCircleDiv.style.borderRadius = "50%";
        closeCircleDiv.style.color = "white";
        closeCircleDiv.style.padding = "28px";
        closeCircleDiv.style.cursor = "pointer";
        closeCircleDiv.style.display = "none";
        closeCircleDiv.style.zIndex = "9999";
        closeCircleDiv.style.boxSizing = "unset";
        closeCircleDiv.style.boxShadow =
            "0px 3px 16px 0px rgba(0, 0, 0, 0.6), 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 1px 5px 0 rgba(0, 0, 0, 0.12)";
        mainDiv.appendChild(closeCircleDiv);

        var closeLogoIcon = document.createElement("img");
        closeLogoIcon.id = "close-logoIcon";
        closeLogoIcon.src = "https://ik.imagekit.io/softToPos/cancel.svg";
        closeLogoIcon.setAttribute("width", "100%");
        closeCircleDiv.appendChild(closeLogoIcon);

        var closeOverLayDiv = document.createElement("div");
        closeOverLayDiv.id = "close-overlay";
        closeOverLayDiv.style.background = "rgba(255, 255, 255, 0.1)";
        closeOverLayDiv.style.position = "absolute";
        closeOverLayDiv.style.top = "0";
        closeOverLayDiv.style.left = "0";
        closeOverLayDiv.style.width = "100%";
        closeOverLayDiv.style.height = "100%";
        closeOverLayDiv.style.borderRadius = "50%";
        closeOverLayDiv.style.display = "none";
        closeCircleDiv.appendChild(closeOverLayDiv);
    }

    async function callConnectApi() {
        let data = await fetch(`${mainUrl}/api/v1/website/qr`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${myToken}`,
                "Content-Type": "image/svg+xml",
            },
        })
            .then((resp) => resp.json())
            .then((json) => {
                return json;
            });
        return data;
    }

    async function callPaymentRequestApi() {
        var dynamicBtn = document.querySelector(`#${settings.btn_id}`);

        var total = dynamicBtn.dataset.total;
        var metaData = dynamicBtn.dataset.meta;

        var meta = {};

        try {
            var testIfJson = JSON.parse(metaData);
            if (typeof testIfJson == "object") {
                meta = testIfJson;
            } else {
                console.log("meta is not json object");
            }
        }
        catch {
            console.log("meta is not json object");
        }

        var ref = dynamicBtn.dataset.ref;

        let data = await fetch(`${mainUrl}/api/v1/requests/create`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${myToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                total: total,
                meta: meta,
                ref: ref,
            }),
        })
            .then((resp) => {
                return resp.json();
            })
            .then((json) => {
                return json;
            })
            .catch((error) => {
                console.log(error);
                throw error;
            });
        return data;
    }

    async function callPaymentStatusApi(uuid) {
        let data = await fetch(`${mainUrl}/api/v1/requests/get/${uuid}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${myToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((resp) => resp.json())
            .then((json) => {
                return json;
            });
        return data;
    }

    async function callPaymentStatusCancelApi(uuid) {
        let data = await fetch(`${mainUrl}/api/v1/requests/cancel/${uuid}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${myToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((resp) => resp.json())
            .then((json) => {
                return json;
            });
        return data;
    }

    function events() {
        var cancelRequest = document.querySelector("#close-circle");
        cancelRequest.addEventListener("click", async function () {
            var dynamicPayBtn = document.querySelector(`#${settings.btn_id}`);
            dynamicPayBtn.innerText = payment_text;
            dynamicPayBtn.disabled = false;
            stop = true;
            cancelRequest.style.display = "none";
            let check = await callPaymentStatusCancelApi(uuid);
            console.log(check);
        });

        // dynamic pay button
        var dynamicBtn = document.querySelector(`#${settings.btn_id}`);
        if (dynamicBtn) {
            dynamicBtn.addEventListener("click", async function () {
                stop = false;
                try_count = 0;
                await runRequestApi();
            });
        }

        var chatCircle = document.querySelector("#chat-circle");
        chatCircle.addEventListener("click", function () {
            displayQRCode();
        });

        var chatBoxToggle = document.querySelector("#qr-box-toggle");
        chatBoxToggle.addEventListener("click", function () {
            var chatBox = document.querySelector("#qr-box");
            chatBox.style.display = "none";
        });
    }

    async function runRequestApi() {
        var dynamicPayBtn = document.querySelector(`#${settings.btn_id}`);
        dynamicPayBtn.innerText = "";

        var warpLoadDiv = document.createElement("div");
        warpLoadDiv.id = "warpLoadDiv";
        warpLoadDiv.style.display = "flex";
        warpLoadDiv.style.justifyContent = "center";
        // warpLoadDiv.style.padding = "22px";
        var loaderDiv = document.createElement("div");
        loaderDiv.id = "loaderDiv";
        loaderDiv.style.width = "30px";
        loaderDiv.style.height = "30px";
        loaderDiv.style.border = "5px solid #FFF";
        loaderDiv.style.borderBottomColor = loader_color;
        loaderDiv.style.borderRadius = "50%";
        loaderDiv.style.display = "inline-block";
        loaderDiv.style.boxSizing = "border-box";
        loaderDiv.style.animation = "rotation 1s linear infinite";
        warpLoadDiv.appendChild(loaderDiv);
        dynamicPayBtn.appendChild(warpLoadDiv);

        var request = await callPaymentRequestApi();

        if (request.message == "Unauthenticated.") {
            stop = true;
            dynamicPayBtn.innerText = "Unauthenticated";
            dynamicPayBtn.disabled = true;
            dynamicPayBtn.style.backgroundColor = "#e22828";

            setTimeout(async () => {
                dynamicPayBtn.innerText = payment_text;
                dynamicPayBtn.disabled = false;
                dynamicPayBtn.style.backgroundColor = "black";
            }, 3000);
        }

        if (request.statusCode == 404) {
            stop = true;
            dynamicPayBtn.innerText = "Device not connected";
            dynamicPayBtn.disabled = true;
            dynamicPayBtn.style.backgroundColor = "#e22828";

            setTimeout(async () => {
                dynamicPayBtn.innerText = payment_text;
                dynamicPayBtn.disabled = false;
                dynamicPayBtn.style.backgroundColor = "black";
            }, 3000);
        }

        if (request.statusCode == 200) {
            var cancelRequest = document.querySelector("#close-circle");
            cancelRequest.style.display = "block";
            loaderDiv.style.display = "none";
            dynamicPayBtn.innerText = payment_pending_text;
            dynamicPayBtn.disabled = true;

            uuid = request.uuid;
            await runRecoursiveApi(uuid);
            setTimeout(async () => {
                console.log("time out...");
                stop = true;
                cancelRequest.style.display = "none";
                dynamicPayBtn.innerText = "Request time out";
                dynamicPayBtn.disabled = false;
                dynamicPayBtn.style.backgroundColor = "#e22828";
                setTimeout(async () => {
                    dynamicPayBtn.innerText = payment_text;
                    dynamicPayBtn.disabled = false;
                    dynamicPayBtn.style.backgroundColor = "black";
                }, 3000);
            }, 1500 * 60);
        }
    }

    async function runRecoursiveApi(uuid) {
        console.log(try_count);
        console.log(uuid);
        if (stop) return 0;
        let status = await callPaymentStatusApi(uuid);
        var dynamicPayBtn = document.querySelector(`#${settings.btn_id}`);
        var cancelRequest = document.querySelector("#close-circle");

        if (status.success) {
            stop = true;
            cancelRequest.style.display = "none";
            dynamicPayBtn.innerText = payment_success_text;
            dynamicPayBtn.disabled = false;
            dynamicPayBtn.style.backgroundColor = "rgb(0, 204, 153)";

            if (success_url) {
                setTimeout(async () => {
                    window.location.href = success_url;
                }, 2000);
            } else {
                setTimeout(async () => {
                    dynamicPayBtn.innerText = payment_text;
                    dynamicPayBtn.disabled = false;
                    dynamicPayBtn.style.backgroundColor = "black";
                }, 2000);
            }
        }

        if (status.faild) {
            stop = true;
            cancelRequest.style.display = "none";
            dynamicPayBtn.innerText = payment_failed_text;
            dynamicPayBtn.disabled = false;
            dynamicPayBtn.style.backgroundColor = "#e22828";

            if (fail_url) {
                setTimeout(async () => {
                    window.location.href = fail_url;
                }, 2000);
            } else {
                setTimeout(async () => {
                    dynamicPayBtn.innerText = payment_text;
                    dynamicPayBtn.disabled = false;
                    dynamicPayBtn.style.backgroundColor = "black";
                }, 2000);
            }
        }

        setTimeout(async () => {
            if (stop) return 0;
            try_count++;
            console.log("test running...");
            await runRecoursiveApi(uuid);
        }, 1000);
    }

    function webSocket(url) {
        var socket = new WebSocket(url);

        socket.addEventListener("", (event) => {
            console.log("Connection opend");
        });

        socket.addEventListener("", (event) => {
            console.log(event);
        });
    }

    // generate and display QR code for token
    this.displayConnectView = function () {
        mainView();
        events();
    };

    this.displayConnectView();
}
