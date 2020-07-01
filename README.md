# RankingSystem_backend

Time to make the backend: 2 days

## Technical / Architectural choices 

    The language used is Typescript, which allows to write typed javascript.
    There is no real database, as the time allocated for the project is relatively short. Instead, all the informations are stored into a JSON file.

    The class socketController listens for any client requests. For each of those request, the server checks for the client argument format.
    The class then emits a response (eventStatusController interface) to the client specifying the success or the failure of the operation as well as a message precising what went wrong.

    The player class contains only a name and a score. The name cannot be set, while the score can but only if the new score is higher than the old one.

## Difficulties

    The main difficulty was to learn how typescript and node js work, as this is one of my first projects.

## Further ahead

    The way of keeping the players' score informations is not persistent. It is only stored as a file in the server.
    I also have some concerns about concurrency, as I do not know how it will behave if two users push a score at the exact same time. If I understood well, because of the "writeSync" function, this should not be a problem but this is to be tested.

    The solution to keep everything in an array is also not persistent. On one hand it allows a fetching of a player that is much faster than fetching in from a real database. On the other hand, I also have doubts about how many values can be stored into an array: it might cause the server to crash, or at least to be slow.

    Finally, the server is not protected from javascript dependency injections. This is something I might get into if I have enough time.

## My comments

    