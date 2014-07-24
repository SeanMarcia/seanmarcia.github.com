<<<<<<< HEAD
var github = {
  showRepos: function(options) {
    this.options = options;
    this._getData();
  },
  _getData: function() {
    $.getJSON("https://api.github.com/users/"+this.options.user+"/repos?callback=?", $.proxy(this._getDataCallback, this));
  },
  _getDataCallback: function(data) {
    var repos = [];
    if (!data || !data.data) { return; }
    for (var i = 0; i < data.data.length; i++) {
      if (this.options.skip_forks && data.data[i].fork) { continue; }
      repos.push(data.data[i]);
    }
    repos.sort(function(a, b) {
      var aDate = new Date(a.pushed_at).valueOf(),
          bDate = new Date(b.pushed_at).valueOf();

      if (aDate === bDate) { return 0; }
      return aDate > bDate ? -1 : 1;
    });

    if (this.options.count) { repos.splice(this.options.count); }
    this._render(this.options.target, repos);
  },
  _render: function(target, repos) {
    var i = 0, fragment = '', t = $(target)[0];

    for(i = 0; i < repos.length; i++) {
      fragment += '<dt><a href="'+repos[i].html_url+'">'+repos[i].name+'</a><a rel="tooltip" href="'+repos[i].html_url+'" title="open sourced at Github"><img class="social_icon" src="/images/glyphicons_381_github.png" alt="github icon" title="Github"/></a></dt><dd>'+(repos[i].description||'&nbsp;')+'</p></dd>';
    }
    t.innerHTML = fragment;
  }
};
=======
var github = (function(){
  function render(target, repos){
    var i = 0, fragment = '', t = $(target)[0];

    for(i = 0; i < repos.length; i++) {
      fragment += '<li><a href="'+repos[i].url+'">'+repos[i].name+'</a><p>'+repos[i].description+'</p></li>';
    }
    t.innerHTML = fragment;
  }
  return {
    showRepos: function(options){
      $.ajax({
          url: "https://api.github.com/users/"+options.user+"/repos?callback=?"
        , type: 'jsonp'
        , error: function (err) { $(options.target + ' li.loading').addClass('error').text("Error loading feed"); }
        , success: function(data) {
          var repos = [];
          if (!data || !data.data) { return; }
          for (var i = 0; i < data.data.length; i++) {
            var currentRepo = data.data[i];
            if (options.skip_forks && currentRepo.fork) { continue; }
            repos.push(currentRepo);
          }
          repos.sort(function(a, b) {
            var aDate = new Date(a.pushed_at).valueOf(),
                bDate = new Date(b.pushed_at).valueOf();

            if (aDate === bDate) { return 0; }
            return aDate > bDate ? -1 : 1;
          });

          if (options.count) { repos.splice(options.count); }
          render(options.target, repos);
        }
      });
    }
  };
})();
>>>>>>> 6515e152b7c4bd75784ada3ab6b3f77da912f2d1
