// ==UserScript==
// @name         Simplified web learning
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  remove useless elements on web learning front page
// @author       DimLight1998
// @match        https://learn.tsinghua.edu.cn/f/wlxt/index/course/student/
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js
// @run-at       document-idle
// ==/UserScript==

/* global $, _ */
function addStyle(css) {
    var newNode = document.createElement('style');
    newNode.textContent = css;
    var t = document.getElementsByTagName('head')[0] || document.body || document.documentElement;
    t.appendChild(newNode);
}

setTimeout(function () {
    'use strict';
    let cssLinks = [
        'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/label.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/components/table.min.css'
    ];
    _.map(cssLinks, link => $.get(link).then(css => addStyle(css)));

    $('#myTabContent>div:last-child').css('display', 'none');
    $('div#course1').css('margin-left', 'auto').css('margin-right', 'auto');

    let directText = o => o.clone().children().remove().end().text();
    let courses = $('dd.clearfix.stu');
    let links = courses.map((_i, e) => $(e).find('a.title.stu').attr('href')).toArray();
    let names = courses.map((_i, e) => $(e).find('a.title.stu').text()).toArray();
    let notices = courses.map((_i, e) => directText($(e).find('span.orange'))).toArray();
    let materials = courses.map((_i, e) => directText($(e).find('span.wee'))).toArray();
    let homeworks = courses.map((_i, e) => directText($(e).find('span.green'))).toArray();
    let noticesTotal = courses.map((_i, e) => /.*?(\d+)/.exec(directText($(e).find('ul > li:nth-child(2) > p > span')))[1]).toArray();
    let materialsTotal = courses.map((_i, e) => /.*?(\d+)/.exec(directText($(e).find('ul > li:nth-child(3) > p > span')))[1]).toArray();
    let homeworksTotal = courses.map((_i, e) => /.*?(\d+)/.exec(directText($(e).find('ul > li:nth-child(4) > p > span')))[1]).toArray();
    let noticesLinks = courses.map((_i, e) => $(e).find('ul > li:nth-child(2) > a').attr('href')).toArray();
    let materialsLinks = courses.map((_i, e) => $(e).find('ul > li:nth-child(3) > a').attr('href')).toArray();
    let homeworksLinks = courses.map((_i, e) => $(e).find('ul > li:nth-child(4) > a').attr('href')).toArray();

    let row = _.template(`
    <tr>
        <td>
            <a href=<%= link %>><%= name %></a>
        </td>
        <td class="ui center aligned">
            <a href="<%= noticeLink %>">
                <div class="ui <%= parseInt(notice) === 0 ? '' : 'orange' %> label" style="width: 5em;">
                    <%= notice %> / <%= noticeTotal %>
                </div>
            </a>
        </td>
        <td class="ui center aligned">
            <a href="<%= materialLink %>">
                <div class="ui <%= parseInt(material) === 0 ? '' : 'orange' %> label" style="width: 5em;">
                    <%= material %> / <%= materialTotal %>
                </div>
            </a>
        </td>
        <td class="ui center aligned">
            <a href="<%= homeworkLink %>">
                <div class="ui <%= parseInt(homework) === 0 ? '' : 'orange' %> label" style="width: 5em;">
                    <%= homework %> / <%= homeworkTotal %>
                </div>
            </a>
        </td>
    </tr>
    `);
    let table = _.template(`
    <table class="ui celled table">
        <thead><tr>
            <th>课程</th>
            <th class="center aligned">未读通知</th>
            <th class="center aligned">未读课件</th>
            <th class="center aligned">未交作业</th>
        </tr></thead>
        <tbody>
        <%= body %>
        </tbody>
    </table>
    `);

    let rows = _.reduce(_.map(_.zip(
        links, names, notices, materials, homeworks, noticesLinks, materialsLinks, homeworksLinks, noticesTotal, materialsTotal, homeworksTotal
    ), o => row({
        link: o[0],
        name: /(.*)(\(\d+-\d+\))/.exec(o[1])[1],
        notice: o[2], material: o[3], homework: o[4],
        noticeLink: o[5], materialLink: o[6], homeworkLink: o[7],
        noticeTotal: o[8], materialTotal: o[9], homeworkTotal: o[10]
    })), (a, b) => a + b);
    let content = table({ body: rows });

    $('#suoxuecourse').replaceWith(content);
}, 1000);

