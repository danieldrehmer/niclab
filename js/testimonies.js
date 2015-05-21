// if we decide upon another name later we can simply change this variable
var g_orgName = "NicLabs";
 
// defines how long it takes for the testimonies switch.
var g_testimoniesInterval = 10000;
 
 
var g_testimonies = [
	{
		"id":1,
		"author_id":1,
		"content": "They work amazingly well under deadline, delivering a complex web application on time and on budget"
	},
	{
		"id":2,
		"author_id":1,
		"content": "Their staff and leadership are talented, know web development inside out, and have accomplished everything we've asked for"
	},
	{
		"id":3,
		"author_id":1,
		"content": "We couldn't be happier with our relationship -- it is no overstatement to say "+ g_orgName +" has been key to our success"
	},
	{
		"id":4,
		"author_id":2,
		"content": g_orgName + " helps us respond quickly to opportunities with surge engineeting capacity for our team"
	},
	{
		"id":5,
		"author_id":3,
		"content": "I have worked with "+ g_orgName +" on numerous projects over the past decade and found them to be reliable, timely, and professional"
	},
	{
		"id":6,
		"author_id":3,
		"content": "They love their work, and having their engagement and effort alongside me was always a pleasure"
	},
	{
		"id":7,
		"author_id":4,
		"content": "The applications they build just work right out of the gate, their code is clean and well-organized, and they deliver on-time, every time"
	},
	{
		"id":8,
		"author_id":4,
		"content": "They've been a valued partner, working with us through the lows of start-up phase to the pressure that came with the growing popularity"
	},
];
 
var g_authors = [
	{
		"id":1,
		"name": "Jason Rosenbaum",
		"title":"Director of Technology",
		"organization": "Action Network",
		"image": "img/jason.jpg",
	},
	{
		"id":2,
		"name": "Nathan Woodhull",
		"title":"Founder",
		"organization": "ControlShift",
		"image": "img/nathan.jpg",
	},
	{
		"id":3,
		"name": "Jerome Armstrong",
		"title":"Co-founder",
		"organization": "Vox Media & Webstrong Group",
		"image": "img/jerome.jpg",
	},
	{
		"id":4,
		"name": "Brian Young",
		"title":"Executive Director",
		"organization": "Action Network",
		"image": "img/brian.jpg",
	},
];
 
 
        $("document").ready(function(){
 
            $(".testimonies").hide();
            
            refreshTestimonies();
 
            setInterval(function(){refreshTestimonies()}, g_testimoniesInterval);
 
 
        });
 
 
        function refreshTestimonies(){
            $(".testimonies").fadeOut(1000, function(){
                updateQuoteBoxes()    
            }).fadeIn(1000);
        }
 
 
        function findById(collection, id){
            var returnObj = {};
 
            $.each(collection, function(i,e){
                if(collection[i].id == id){
                    returnObj = collection[i]
                }
            });
            return returnObj
        }
 
        // returns three random quotes from unrepeated authors
        function findRandomQuotes(){
            var limit = g_testimonies.length;
 
            var quotes = [];
 
            var francis = {}; 
 
 
            while (quotes.length < 3) {
 
                var candidateId = parseInt(Math.floor(Math.random() * (limit - 1 + 1)) + 1);
 
 
                var quote = findById(g_testimonies, candidateId);
 
                if (francis[quote.author_id] == undefined){
                    quotes.push(quote);
                    francis[quote.author_id] = "";
                }
            }
            return quotes
        }
 
 
        function updateQuoteBoxes(){
            var quotes = findRandomQuotes();
 
            $(".testimony").each(function(i,e){
                var quote = quotes[i];
                var author = findById(g_authors, quote.author_id);
 
                $(this).children("p").text(quote.content)
                $(this).children("footer").first().children("img").attr("src", author.image)
                $(this).children("footer").first().children("div").html(author.name + "<br /><small> " + author.title + " of " + author.organization + "</small>")
            })
        }