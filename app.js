var fs = require('fs');
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app = express();




function parsePage(html, results_array) {
    var $ = cheerio.load(html);
    $('.annonce').each(function(i, element){

        var description = $(element).find('.annonce_get_description');
        description.find('.annonce_description_preview').remove();

        var item = {
            title: $(element).find('.annonce_titre').find('h2').first().text(),
            description: description.text().replace(/(?:\r\n|\r|\n)/g, ''),
            price: $(element).find('span[itemprop=price]').text()
        }
        //console.log( JSON.stringify(item, null, 2) );
        results_array.push(item);

    });
}


app.get('/scrape', function(req, res){
    var url = 'https://www.ouedkniss.com/informatique/ordinateur-portable/laptop/';

    var page_start = 0;
    var page_end = 100;
    var pages = (page_end - page_start) + 1;

    var responses = [];
    var results = [];

    for (var i=page_start; i<page_end + 1; i++){

        request.get(url + i, function(error, res, html){
            responses.push(html);


            console.log('Page ' + ' was scraped!');
            //console.log(res.headers);
            console.log('');

            if (responses.length == pages){
            //all finished now do things
                for (var i in responses) {
                    parsePage(responses[i], results);
                    //console.log(parsePage);
                }

                //stringify and save JSON object to file
                fs.writeFile('output.json', JSON.stringify(results, null, 2), function(err){
                    console.log('Your results have been saved!');
                })

                //load and parse JSON file to object
                fs.readFile('output.json', 'utf8', function (err,data) {
                    if (err) {
                        return console.log(err);
                    }

                    // var ob = JSON.parse(data);
                    // console.log(ob);
                });

            }
        });

    }

    res.send('I am scraping oued!');

});


app.listen(3005);
