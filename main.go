package main

import (
	"log"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	e.Static("/", "view/")
	err := e.Start(":80")
	if err != nil {
		log.Fatalf("%v", err)
	}
}
