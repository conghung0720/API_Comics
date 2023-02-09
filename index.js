const axios = require("axios");
const express = require("express");
const cheerio = require("cheerio");
const res = require("express/lib/response");
const cors = require("cors");
let bodyParser = require("body-parser");
const dotenv = require("dotenv");
// const rateLimiter = require("express-rate-limit");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
dotenv.config();
app.use(
  bodyParser.urlencoded({
    parameterLimit: 50000,
    limit: "50mb",
    extended: true,
  })
);

// for (let i = 1; i < 390; i++)
//   fetchData(i).then((data) => {
//     return data;
//   });

let urlManga = "https://www.truyentranhlh.net/truyen-tranh/";

app.get("/lhManga/:chapters/:chap", (res, req) => {
  let url = urlManga + res.params.chapters + "/" + res.params.chap;
  try {
    axios
      .get(url)
      .then((res) => {
        const datas2 = [];
        const html = res.data;
        const $ = cheerio.load(html);
        let imageChapter = [];
        $("div#chapter-content").each(function () {
          $(this)
            .find("img")
            .each(function () {
              imageChapter.push($(this).attr("data-src"));
            });
          datas2.push({ imgChapter: imageChapter });
        });
        req.status(200).json(datas2);
      })
      .catch((error) => console.log(error.toJSON()));
  } catch (err) {
    req.status(404).json("Wrong Url");
    console.error(err);
  }
});

app.get("/lhManga/:chapters", (res, req) => {
  try {
    // const limit = Number(res.query.limit);

    let url = urlManga + res.params.chapters;
    axios(url)
      .then((res) => {
        const html = res.data;
        const $ = cheerio.load(html);
        let chapter = [];
        let chapterNumber = [];
        let getTimeOfChapter = [];
        let tags = [];
        const data1 = [];
        $(".row.d-md-table.w-md-100").each((index, el) => {
          const data = $(el);
          const title = data.find("span.series-name").text();
          // const tags = data
          //   .find("span.info-value a span.badge.badge-info.bg-lhmanga.mx-1")
          //   .text();
          const time = data
            .find("div.row.statistic-list time.timeago")
            .attr("title");

          const fullDatas = data
            .find("div.col-4.statistic-item div.statistic-value")
            .text();
          const [days, timing] = fullDatas.split(" ");
          const views = fullDatas.split(" ")[3].slice(2);
          const summary = data.find("div.summary-content").text();
          const chapter_number = data
            .find("ul.list-chapters.at-series a")
            .attr("title");
          const img = data
            .find("div.a6-ratio div.content.img-in-ratio")
            .css("background-image")
            .slice(5, -2);

          $("ul.list-chapters.at-series").each(function () {
            $(this)
              .find("a div.chapter-name.text-truncate")
              .each(function () {
                const getChapter = $(this).text().trim().split(" ");
                getChapter.shift();
                chapterNumber.push(getChapter.join(" "));
              });
            $(this)
              .find("a div.chapter-time")
              .each(function () {
                const getDate = $(this).text().split("/").reverse().join("/");
                getTimeOfChapter.push(getDate);
              });
          });

          $("span.info-value").each(function () {
            $(this)
              .find("span.badge.badge-info.bg-lhmanga.mx-1")
              .each(function () {
                tags.push($(this).text());
              });
          });
          let DiffName = [];
          $("div.series-information").each(function () {
            $(this)
              .find("span.info-value")
              .each(function () {
                DiffName.push($(this).text());
              });
          });

          $("ul.list-chapters.at-series").each(function () {
            $(this)
              .find("a")
              .each(function () {
                chapter.push($(this).attr("href").split("/")[5]);
              });
          });

          const data_of_lhmanga = {
            title: title,
            difName: DiffName.slice(0, 1),
            tags: tags,
            days: days,
            time: timing,
            views: Number(views),
            img: img,
            summary: summary,
            Link: url.slice(43),
            chapter: chapterNumber,
            timeChapter: getTimeOfChapter,
            chapter_url: chapter,
          };
          data1.push(data_of_lhmanga);
        });
        req.status(200).json(data1);
      })
      .catch((error) => req.status(404).json([]));
  } catch (err) {
    req.status(404).json("Wrong URL");
  }
});

app.get("/search", async (res, req) => {
  const list = res.query.list;
  const startPage = 1;
  const endPage = 10;
  const page = res.query.page;
  const keyword = res.query.keyword;
  let url;

  try {
    if (list === "update") url = `update`;
    if (list === "top") url = `top`;
    const datas = [];
    const res = await axios.get(
      `https://www.truyentranhlh.net/tim-kiem?q=${keyword}&page=${page}`
    );
    const html = await res.data;
    const $ = cheerio.load(html);

    $(".thumb-item-flow.col-6.col-md-2", html).each(function (index, el) {
      // console.log(index);
      const link = $(this).find("a").attr("href");
      const Id = $(this).find("div").attr("data-id");
      const img = $(this).find("div.content.img-in-ratio").attr("data-bg");
      const title = $(this).find("div.thumb_attr.series-title a").text();
      const chapter = $(this)
        .find("div.thumb_attr.chapter-title.text-truncate a")
        .text();

      const getChapter = chapter.split(" ");
      getChapter.shift();
      getChapter.join(" ");

      datas.push({
        Link: link.slice(43),
        title: title,
        chapter: getChapter,
        id: Id,
        img: img,
      });
    });
    req.status(200).json(datas);
  } catch (err) {
    req.status(404).json([]);
  }
});

//Routes
app.get("/lhManga", async (res, req) => {
  const list = res.query.list;
  const limitPage = +res.query.page;
  let url;

  try {
    if (list === "update") url = `update`;
    if (list === "top") url = `top`;
    const datas = [];
    const res = await axios.get(
      `https://www.truyentranhlh.net/tim-kiem?sort=${list}&page=${limitPage}`
    );

    const html = await res.data;
    const $ = cheerio.load(html);

    $(".thumb-item-flow.col-6.col-md-2", html).each(function (index, el) {
      // console.log(index);
      const link = $(this).find("a").attr("href");
      const Id = $(this).find("div").attr("data-id");
      const img = $(this).find("div.content.img-in-ratio").attr("data-bg");
      const title = $(this).find("div.thumb_attr.series-title a").text();
      const chapter = $(this)
        .find("div.thumb_attr.chapter-title.text-truncate a")
        .text();

      const getChapter = chapter.split(" ");
      getChapter.shift();
      getChapter.join(" ");

      datas.push({
        Link: link.slice(43),
        title: title,
        chapter: getChapter,
        id: Id,
        img: img,
      });
    });

    req.status(200).json(datas);
    // }
  } catch (err) {
    req.status(404).json([]);
  }
});

///

//
app.listen(process.env.PORT || 8000, () => {
  console.log("Server's running");
});
