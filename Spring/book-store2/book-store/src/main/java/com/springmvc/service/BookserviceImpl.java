package com.springmvc.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springmvc.domain.Book;
import com.springmvc.repository.BookRepository;

@Service
public class BookserviceImpl implements BookService {
	@Autowired
	private BookRepository bookRepository;
	@Override
	public List<Book> getAllBookList() {
		return this.bookRepository.getAllBookList();
	}

}
