package main

func Mailtemplate() string {
	return `
<html><body>
<h3>🤖 Remindabot Report</h3>
<img src="https://cdn2.iconfinder.com/data/icons/date-and-time-fill-outline/64/alarm_clock_time_reminder-256.png" />
<p>Hello <b>{{.}}</b>, pls find your reminders below:</p>
</body></html>
`
}
