FORMAT: 1A
SERVICE: basepath2
# Return all the things
Lists all the things from the API

## Things [/things]

### Retrieve all the things [GET]

+ Response 200 (application/json;charset=UTF-8)

    + Body

                [
                    {
                        "text":"NES",
                        "id": "1"
                    },
                    {
                        "text":"Atari",
                        "id": "2"
                    },
                    {
                        "text":"The Beatles",
                        "id": "3"
                    },
                    {
                        "text":"Grandma",
                        "id": "4"
                    },
                    {
                        "text":"80s",
                        "id": "5"
                    }
                ]


### Create a new thing [POST]

+ Request (application/json)

    + Body

            {
                "text": "Hyperspeed boat"
            }

+ Response 200 (application/json;charset=UTF-8)

    + Body

            {
                "text": "Hyperspeed boat",
                "id": "2"
            }
  