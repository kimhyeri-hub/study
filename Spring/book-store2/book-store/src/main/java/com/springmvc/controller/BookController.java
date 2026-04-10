package com.springmvc.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

import com.springmvc.domain.Book;
import com.springmvc.service.BookService;

@Controller
@RequestMapping("/books")
public class BookController {
	@Autowired
	private BookService bookService;
	
	@GetMapping
	public String requestBookList(Model model) {
		List<Book> list = this.bookService.getAllBookList();
		model.addAttribute("bookList",list);
		return "books";
	}
	
	@GetMapping("/all") //~~~/books/all
	public ModelAndView requestAllBooks() {
		List<Book> list = this.bookService.getAllBookList();
		
		ModelAndView mav = new ModelAndView();
		mav.addObject("bookList", list);
		mav.setViewName("books");
		return mav;
	}
}
