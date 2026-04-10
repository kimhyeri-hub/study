package com.springmvc.repository;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;

import com.springmvc.domain.Book;

public class BookRowMapper implements RowMapper<Book> {
	
	@Override
	public Book mapRow(ResultSet rs, int rowNum) throws SQLException {
		Book book = new Book();
		book.setBookId(rs.getString("b_bookId"));
		book.setName(rs.getString("b_name"));
		book.setUnitPrice(rs.getInt("b_unitPrice"));
		book.setAuthor(rs.getString("b_author"));
		book.setDescription(rs.getString("b_description"));
		book.setPublisher(rs.getString("b_publisher"));
		book.setCategory(rs.getString("b_category"));
		book.setUnitsInStock(rs.getLong("b_unitsInStock"));
		book.setReleaseDate(rs.getString("b_releaseDate"));
		book.setCondition(rs.getString("b_condition"));
		return book;
	}
}