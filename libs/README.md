# Создание приложений
Давайте для начала напишем Hello World.<br>
В файл content папки вашего приложения передаём значение переменной appcontent:

`
appcontent = 'Hello World!'
`

На выходе мы получаем:

![image](https://user-images.githubusercontent.com/77122703/160296611-8a53d2f5-7f77-4362-8a9d-6b52cc90447a.png)

Дальше разобраться очень просто.<br>
Можно использовать любой код, главное чтобы он использовал стандартные библиотеки DWM<br>
Используйте HTML в связке с Python, так можно.

# Графическое API
Можно использовать в onclick:

`close()` - закрывает текущее приложение<br>
`minimize()` - сворачивает текущее приложение<br>
`maximize()` - разворачивает текущее приложение<br>
`reloadapp()` - перезагружает текущее приложение<br>
`window(title, content)` - запуск дочернего приложения<br>
`closeall()` - закрывает все окна<br>
`minimizeall()` - сворачивает все окна<br>
`start(appid)` - запускает приложение<br>

Можно использовать в терминале:

`javascript(jscode)` - терминал выполнит ваш код<br>
`termexit()` - завершает процесс терминала<br>

Можно использовать в appcontent:

`button(classname, onclick, typename, text, id, right):` - создаёт кнопку (обяз. параметры: text)<br>
`script(url)` - создаёт meta-тег скрипта (обяз. параметры: url)<br>
`iframe(url)` - создаёт iframe (обяз. параметры: url)<br>
