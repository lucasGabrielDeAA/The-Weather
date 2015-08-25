function consulta()
{
 navigator.geolocation.getCurrentPosition
 (
  function(pos)
  {
   latitude = pos.coords.latitude;
   longitude = pos.coords.longitude;

   requisicaoHTTPcidade(latitude, longitude);
  }
 );
}

function loadingShow()
{
 setTimeout(function()
 {
  $.mobile.loading( "show",
  {
   text: "...Obtendo Informações...",
   textVisible: true,
   theme: "a",
   textonly: true,
   html: ""
  });
 }, 5);  
}

function loading(showOrHide)
{
 setTimeout(function()
 {
  $.mobile.loading(showOrHide);
 }, 5); 
}


function requisicaoHTTPcidade(latitude, longitude)
{
 var requisicao_cidade = new XMLHttpRequest();

 requisicao_cidade.onloadend = function()
 {
  resposta_cidade = requisicao_cidade.responseText;
  resposta_cidade_obj = JSON.parse(resposta_cidade);

  var cidade = resposta_cidade_obj["results"][0]["address_components"][3]["long_name"];

  consulta5dias(cidade);
  requisicaoHTTP(cidade);
 }

 requisicao_cidade.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+latitude+','+longitude);
 requisicao_cidade.send(null);
}

function requisicaoHTTP(cidade)
{
 var requisicao = new XMLHttpRequest();

 requisicao.onloadend = function()
 {
  resposta = requisicao.responseText;
  resposta_obj = JSON.parse(resposta);
  resposta_nascer = [];
  resposta_por = [];
  resposta_lat = [];
  resposta_long = [];
  resposta_alt = [];
  resposta_mapa = [];

  if(resposta_obj["cod"]!=200)
  {
   alert("A cidade " + cidade + " não consta no banco de dados.");
  }
  else
  {
   horario_sunrise = calculatetimeStamp(resposta_obj["sys"]["sunrise"]);
   horario_sunset = calculatetimeStamp(resposta_obj["sys"]["sunset"]);
   resposta_nascer.push("<p style=\"font-size:10px\"><span style=\"font-size:25px\">" + horario_sunrise +"</span> hs<br>Nascer do Sol");
   resposta_por.push("<p style=\"font-size:10px\"><span style=\"font-size:25px\">" + horario_sunset +"</span> hs<br>Pôr do Sol");

   latitude = resposta_obj["coord"]["lat"];
   resposta_lat.push("<p style=\"font-size:10px\"><span style=\"font-size:25px\">" + latitude +"°</span><br>Latitude");
   longitude = resposta_obj["coord"]["lon"];
   resposta_long.push("<p style=\"font-size:10px\"><span style=\"font-size:25px\">" + longitude +"°</span><br>Longitude");

   nivel = resposta_obj["main"]["sea_level"];
 
   if(nivel==null)
   {
    resposta_alt.push('<p style=\"font-size:10px\">Altitude desconhecida</p>');
   }
   else
   {
    resposta_alt.push("<p style=\"font-size:10px\"><span style=\"font-size:25px\">" + nivel +"</span> m<br>Altitude");
   }

   mapa = '<iframe width="330" height="275" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com.br/?ie=UTF8&amp;ll='
          +resposta_obj["coord"]["lat"]+','+resposta_obj["coord"]["lon"]+'&amp;spn=0.172836,0.337486&amp;t=m&amp;z=12&amp;output=embed"></iframe><br>';
          

   botao = '<a class="ui-btn" href="https://maps.google.com.br/?ie=UTF8&amp;ll='+resposta_obj["coord"]["lat"]+','
           +resposta_obj["coord"]["lon"]+'&amp;spn=0.172836,0.337486&amp;t=m&amp;z=12&amp;source=embed">Ampliado</a>';

   resposta_mapa.push(mapa);

   document.getElementById('nome').innerHTML = "<h1>" + cidade + "</p>";
   document.getElementById('botao').innerHTML = botao;
   document.getElementById('respostanascer').innerHTML = resposta_nascer.join("<br>");
   document.getElementById('respostapor').innerHTML = resposta_por.join("<br>");
   document.getElementById('respostalat').innerHTML = resposta_lat.join("<br>");
   document.getElementById('respostalong').innerHTML = resposta_long.join("<br>");
   document.getElementById('respostaalt').innerHTML = resposta_alt.join("<br>");    
   document.getElementById('respostamapa').innerHTML = resposta_mapa.join("<br>");

   loading('hide');
  }
 }
 requisicao.open('GET', 'http://api.openweathermap.org/data/2.5/weather?q=' + cidade);
 requisicao.send(null);
}

function consulta5dias(cidade)
{
    var requisicoes = new XMLHttpRequest();

    requisicoes.onloadend = function()
    {
        resposta = requisicoes.responseText;
        resposta_obj = JSON.parse(resposta);
        resposta_consulta = [];
        letras=['a', 'b', 'c', 'd', 'e'];

        if(resposta_obj["cod"]!=200)
        {
            alert("A cidade " + cidade + " não consta no banco de dados.");
        }
        else
        {
            for (i = 0; i < 5; i++)
            {
                resposta_consulta = [];
                                
                var data = dia(resposta_obj["list"][i]["dt"]);
                condicao_do_tempo = '<img src= "http://openweathermap.org/img/w/' + resposta_obj["list"][i]["weather"][0]["icon"] + '.png" width="70px" height="70px"/>';
                temperatura_atual = kelvinForCelsius(resposta_obj["list"][i]["temp"]["day"]);
                temperatura_min = kelvinForCelsius(resposta_obj["list"][i]["temp"]["min"]);
                temperatura_max = kelvinForCelsius(resposta_obj["list"][i]["temp"]["max"]);
                resposta_consulta.push("<p style=\"font-size:9px; text-align:center\" >"+ condicao_do_tempo +"<br>" + data + "<span style=\"font-size:24px\"><br>" + temperatura_atual +"°</span><br/>Mín. " +  temperatura_min + "°<br>Máx. " +  temperatura_max + "°</p><br>");
                                                
                document.getElementById('ui-block-'+letras[i]).innerHTML = resposta_consulta;

                gravaDados(i,data,temperatura_atual);
            }
            geraGrafico();
        }
    }
    requisicoes.open('GET', 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + cidade + '&cnt=5&mode=json');
    requisicoes.send(null);
}

function gravaDados(i,data,temperatura_atual)
{
 //Inserindo no webStorage
 var dado = {'data': data, 'temperatura': temperatura_atual}
 localStorage[i] = JSON.stringify(dado);
}

function geraGrafico()
{
 resposta = [];
 for(i = 0; i<5; i++)
 {
  resposta.push(JSON.parse(localStorage[i]));
 }
  var chart = new CanvasJS.Chart("grafico",
  {
  theme: "theme2",
  title:{
  text: "Temperatura - 5 Dias"
  },
  axisX: {
  valueFormatString: "",
  interval:1,
  intervalType: "day"     
  },
      axisY:{
        includeZero: true,
        valueFormatString: "",
        suffix: "°"
        
      },
      data: [
      {        
        type: "line",
        color: "rgba(255,120,0,.7)",       
        dataPoints:
        [
          { label: resposta[0]['data'].slice(5,11), y: parseInt(resposta[0]['temperatura']) },
          { label: resposta[1]['data'].slice(5,11), y: parseInt(resposta[1]['temperatura']) },
          { label: resposta[2]['data'].slice(5,11), y: parseInt(resposta[2]['temperatura']) },
          { label: resposta[3]['data'].slice(5,11), y: parseInt(resposta[3]['temperatura']) },
          { label: resposta[4]['data'].slice(5,11), y: parseInt(resposta[4]['temperatura']) },
        ]
      }
      
      
      ]
    });

 chart.render();
 }

function dia(date)
{
    var theDate = new Date(date * 1000); 
    var dateString =  theDate.toGMTString();

    return dateString.slice(0,11);
}

function kelvinForCelsius(temperatura)
{
 var valor = temperatura - 273;

 return valor.toFixed(2);
}

function calculatetimeStamp(horario)
{
 var hora = new Date(horario * 1000);

 hora_regular = [];

 var horas;

 if(hora.getHours()<10)
 {
  horas = '0' + hora.getHours();
 }
 else
     horas = hora.getHours();

 if(hora.getMinutes()<10)
 {
  minutos = '0' + hora.getMinutes();
 }
 else
     minutos = hora.getMinutes();

 hora_regular.push(horas);
 hora_regular.push(minutos);

 return hora_regular.join(":");
}

loadingShow();
consulta();

