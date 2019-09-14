$(document).ready(function () {
	const config = {
		github: {
			org: 'Fma965',
			repo: 'statuspage'
		}
	};

	$.getJSON('https://api.github.com/repos/' + config.github.org + '/' + config.github.repo + '/issues?state=all').done(GitHubEntry);

	var maintainIssues = [];
	var incidentIssues = [];

	function GitHubEntry(issues) {
		issues.forEach(function (issue) {
			if (issue.labels.length > 0) {
				issue.labels.forEach(function (label) {
					if (label.name == 'maintenance' && issue.state == 'open') maintainIssues.push(issue);
					else incidentIssues.push(issue);
				});
			}
		});
		_gitHubIncidents(incidentIssues);
		_gitHubMaintainance();
	}

	function _gitHubMaintainance() {
		if (maintainIssues.length > 0) {
			maintainIssues.forEach(function (issue) {
				$('#maintenance').append('<div class="list-group-item">' +
					'<h2 class="list-group-item-heading">' + issue.title + '</h2>' +
					'<p class="list-group-item-text">' + issue.body + '</p>' +
					'</div>');
			});
		}
		else {
			$('#maintenance').append('<div class="list-group-item">' +
				'<h4 class="list-group-item-heading"></h4>' +
				'<p class="list-group-item-text">There is currently no planned maintenance</p>' +
				'</div>');
		}
	}

	function _gitHubIncidents(issues) {
		issues.forEach(function (issue) {
				var status = issue.labels.reduce(function (status, label) {
					if (/^status:/.test(label.name)) {
						return label.name.replace('status:', '');
					} else {
						return status;
					}
				}, 'operational');

				var systems = issue.labels.filter(function (label) {
					return /^system:/.test(label.name);
				}).map(function (label) {
					return label.name.replace('system:', '')
				});

				if (issue.state === 'open') {
					$('#panel').data('incident', 'true');
					$('#panel').attr('class', (status !== 'operational' ? 'panel-danger' : 'panel-warning') );
					$('#paneltitle').html('<a href="#incidents">' + issue.title + '</a>');
				}

				var html = '<article class="timeline-entry">\n';
				html += '<div class="timeline-entry-inner">\n';

				if (issue.state === 'closed') {
					html += '<div class="timeline-icon bg-success"><i class="entypo-feather"></i></div>';
				} else if (issue.state === 'open' && status === 'operational'){
					html += '<div class="timeline-icon bg-warn"><i class="entypo-feather"></i></div>';
				} else {
					html += '<div class="timeline-icon bg-secondary"><i class="entypo-feather"></i></div>';
				}

				html += '<div class="timeline-label">\n';
			html += '<span class="date">' + formatDate(new Date(issue.created_at), 'D d M Y H:i:s (T)') + '</span>\n';

				if (issue.state === 'closed') {
					html += '<span class="badge label-success pull-right">closed</span>';
				} else {
					html += '<span class="badge ' + (status !== 'operational' ? 'label-danger' : 'label-warning') + ' pull-right">open</span>\n';
				}

				for (var i = 0; i < systems.length; i++) {
					html += '<span class="badge system pull-right">' + systems[i] + '</span>';
				}

				html += '<h2>' + issue.title + '</h2>\n';
				html += '<hr>\n';
				html += '<p>' + issue.body + '</p>\n';

				if (issue.state === 'open' && issue.created_at !== issue.updated_at) {
					html += '<p><em>Last update ' + formatDate(new Date(issue.updated_at), 'D d M Y H:i:s (T)') + '</p>'
				}

				if (issue.state === 'closed') {
					html += '<p><em>Updated ' + formatDate(new Date(issue.closed_at), 'D d M Y H:i:s (T)') + '<br/>';
					html += 'The system is back in normal operation.</p>';
				}
				html += '</div>';
				html += '</div>';
				html += '</article>';
				$('#incidents').append(html);
		});
	};

		function formatDate(x, y) {
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		var fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var suffix = ['st', 'nd', 'rd', 'th'];
		var z = {
			a: (x.getHours() >= 12) ? 'pm' : 'am',
			A: (x.getHours() >= 12) ? 'PM' : 'AM',
			B: Math.floor((((x.getUTCHours() + 1) % 24) + x.getUTCMinutes() / 60 + x.getUTCSeconds() / 3600) * 1000 / 24),
			c: x.toISOString(),
			m: (x.getHours().toString().length == 2) ? x.getMonth() + 1 : '0' + x.getMonth() + 1,
			M: months[x.getMonth()],
			n: x.getMonth() + 1,
			L: parseInt(((x.getFullYear() % 4 == 0) && (x.getFullYear() % 100 != 0)) || (x.getFullYear() % 400 == 0)),
			F: fullMonths[x.getMonth()],
			d: (x.getDate().toString().length == 2) ? x.getDate() : '0' + x.getDate(),
			j: x.getDate(),
			D: days[x.getDay()],
			l: fullDays[x.getDay()],
			N: x.getDay() + 1,
			w: x.getDay(),
			h: (x.getHours().toString().length == 2) ? ((x.getHours() + 11) % 12 + 1) : '0' + ((x.getHours() + 11) % 12 + 1),
			H: (x.getHours().toString().length == 2) ? x.getHours() : '0' + x.getHours(),
			G: x.getHours(),
			g: ((x.getHours() + 11) % 12 + 1),
			O: x.toString().match(/([-\+][0-9]+)\s/)[1],
			i: (x.getMinutes().toString().length == 2) ? x.getMinutes() : '0' + x.getMinutes(),
			s: (x.getSeconds().toString().length == 2) ? x.getSeconds() : '0' + x.getSeconds(),
			T: x.toString().replace(/.*[(](.*)[)].*/, '$1'),
			e: x.toString().replace(/.*[(](.*)[)].*/, '$1'),
			Y: x.getFullYear(),
			y: x.getYear(),
			u: 000000,
			v: 000000,
			z: Math.round((new Date().setHours(23) - new Date(x.getYear() + 1900, 0, 1, 0, 0, 0)) / 1000 / 60 / 60 / 24) - 1,
			U: Math.round(x.getTime() / 1000),
		};
		y = y.replace(/(a+|A+|B+|c+|m+|M+|n+|L+|F+|d+|D+|j+|l+|n+|N+|w+|g+|G+|O+|e+|u+|v+|z+|U+|h+|H+|i+|s+|T+|Y+|y+)/g, function (v) {
			var t = eval('z.' + v.slice(-1));
			return t;
		});

		return y.replace(/(y+)/g, function (v) {
			return x.getFullYear().toString().slice(-v.length)
		});
	};
});

    function fetch(key, callback) {
            var httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === 4) {
                    if (httpRequest.status === 200) {
                        callback(JSON.parse(httpRequest.responseText));
                    }
                }
            };
            httpRequest.open("GET", "https://healthchecks.io/api/v1/checks/");
            httpRequest.setRequestHeader("X-Api-Key", key);
            httpRequest.send();
        }

        function timeSince(date) {
            var v = Math.floor((new Date() - date) / 1000);

            if (v < 60) { // v is seconds
                return v + " second" + (v == 1 ? "" : "s");
            }


            v = Math.floor(v / 60); // v is now minutes
            if (v < 60) {
                return v + " minute" + (v == 1 ? "" : "s");
            }

            v = Math.floor(v / 60); // v is now hours
            if (v < 24) {
                return v + " hour" + (v == 1 ? "" : "s");
            }


            v = Math.floor(v / 24); // v is now days
            return v + " day" + (v == 1 ? "" : "s");
         };

        var template = document.querySelector(".check-template");
        function updatePanel(node) {
            fetch(node.dataset.readonlyKey, function(doc) {
                var tag = "TAG_" + node.dataset.readonlyKey.substr(0, 6);


                // Sort returned checks by name:
                var sorted = doc.checks.sort(function(a, b) {
                    return a.name.localeCompare(b.name)
                });

                var fragment = document.createDocumentFragment();
                sorted.forEach(function(item, index) {
					
                    var div = template.cloneNode(true);

                    div.setAttribute("class", tag + " list-group-item status-" + item.status + " service-" + item.name.replace(/ /g,"_"));
                    div.removeAttribute("data-readonly-key");
					div.querySelector(".name").textContent = item.name || "unnamed";
                    if (item.last_ping) {
                        var s = timeSince(Date.parse(item.last_ping)) + " ago";
						
						switch (item.status) {
						  case "up":
							item.status = "Operational";
							break;
						  case "down":
							item.status = "Not Responding";
							break;
						  case "grace":
							item.status = "Pending";
						}
						
                        div.querySelector(".lp").textContent = item.status;
                    }
                    fragment.appendChild(div);
                });


                document.querySelectorAll('.' + tag).forEach(function(element) {
                    element.remove();
                });

                node.parentNode.insertBefore(fragment, node.nextSibling);
            });
        }


        document.querySelectorAll("div").forEach(updatePanel);
        setInterval(function() {
            document.querySelectorAll("div").forEach(updatePanel);
        }, 15000);
