package com.springmvc.repository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.springmvc.domain.Book;

@Repository
public class BookRepositoryImpl implements BookRepository {
	private JdbcTemplate template;

	public BookRepositoryImpl() {
		
	}
	
	@Autowired
	public void setJdbcTemplate(JdbcTemplate template) {
		this.template=template;
	}

	@Override
	public List<Book> getAllBookList() {
		String sql ="select bookId, b_name, b_unitPrice, b_author, b_description, b_publisher"+", b_category, b_unitsInStock, b_releaseDate, b_condition from book";
	List<Book> listOfBooks = this.template.query(sql,new BookRowMapper());
	
	return listOfBooks;
	}
}