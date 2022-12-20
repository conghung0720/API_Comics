const axios = require("axios");
const express = require("express");
const cheerio = require("cheerio");
const res = require("express/lib/response");
const cors = require("cors");
let bodyParser = require("body-parser");
const dotenv = require("dotenv");
// const rateLimiter = require("express-rate-limit");

const app = express();

app.use(bodyParser.json({ limit: "500mb" }));
app.use(cors());
dotenv.config();
app.use(
  bodyParser.urlencoded({
    parameterLimit: 50000,
    limit: "500mb",
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
      .catch((error) => console.log(error.toJSON()))
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
      });
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
                chapterNumber.push($(this).text().trim().split(" ")[1]);
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
            views: views,
            img: img,
            summary: summary,
            link: url.slice(43),
            chapter_number: chapterNumber,
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
console.log(process.env.api);

//Routes
app.get("/lhManga", (res, req) => {
  const datas = [];
  try {
    axios
      .get(`https://www.truyentranhlh.net/tim-kiem?sort=update&page=1`)
      .then((res) => {
        const html = res.data;
        const $ = cheerio.load(html);

        $(".thumb-item-flow.col-6.col-md-2").each((index, el) => {
          const data = $(el);
          //link
          const link = data.find("a").attr("href");
          const Id = data.find("div").attr("data-id");
          const img = data.find("div.content.img-in-ratio").attr("data-bg");
          const title = data.find("div.thumb_attr.series-title a").text();
          const chapter = data
            .find("div.thumb_attr.chapter-title.text-truncate a")
            .text()
            .slice("Chapter".length);
          datas.push({
            Link: link.slice(43),
            title: title,
            chapter: chapter,
            id: Id,
            img: img,
          });
        });
        req.status(200).json(datas);
      })
      .catch((error) => console.log(error.toJSON()));
  } catch (err) {
    req.status(404).json([]);
  }
});

//
app.listen(process.env.PORT || 8000, () => {
  console.log("Server's running");
});
