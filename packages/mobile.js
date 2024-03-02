styleSection = `
    <style>
        .window {
            width: 100% !important;
            height: calc(100% - 35px) !important;
            border: none !important;
            left: 0 !important;
            top: 0 !important;
        }
        [maxim] {
            display: none !important;
        }
        .openedapp img {
            margin-right: 0px !important;
        }
        .openedapp p {
            display: none;
        }
        .openedapp[active] {
            height: 35px;
        }

        .taskmenu {
            width: 100%;
            height: calc(100% - 35px);
            max-height: 100%;
            background: rgb(34, 42, 46);
            display: none;
        }
        .taskmenu[opened] {
            display: block !important;
        }
        
        .blackouter[custompadd] {
            min-height: unset;
        }
        [tracklists] {
            height: calc(100% - 195px);
        }

        .filemanager-bottom p[right] {
            display: none;
        }
    </style>
`;

document.head.innerHTML += styleSection;