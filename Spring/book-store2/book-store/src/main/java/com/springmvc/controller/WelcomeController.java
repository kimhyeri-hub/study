package com.springmvc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class WelcomeController {
	private final Logger log = LoggerFactory.getLogger(WelcomeController.class);
	
	
	
	@RequestMapping(value = "/home", method = RequestMethod.GET)
	public String welcome(Model model) {
		this.log.debug("welcome");
		
		model.addAttribute("greeting","Welcome  to Bookmarket");
		model.addAttribute("strapline","Welcome  to web Shopping Mall!");		
	
		return "welcome";
	}
	
}
