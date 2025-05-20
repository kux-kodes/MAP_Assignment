package com.example.map_assignment.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextForegroundStyle.Unspecified.brush
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.map_assignment.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArticleScreen(navController: NavController) {
    val slateBlue = Color(0xFF6B8E9F)
    val deepTeal = Color(0xFF2D5F6B)
    val warmGray = Color(0xFFD7D2CC)
    val cream = Color(0xFFF5F3EF)
    val darkCharcoal = Color(0xFF333333)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
            ) {
                AsyncImage(
                    model = "https://example.com/article_header.jpg",
                    contentDescription = "Article header image",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    darkCharcoal.copy(alpha = 0.6f)
                                ),
                                start = offset(300f)
                            )
                        )
                )
            }


            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_profile_placeholder),
                        contentDescription = "Author",
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .border(2.dp, slateBlue, CircleShape)
                    )
                    Column(
                        modifier = Modifier.padding(start = 12.dp)
                    ) {
                        Text(
                            text = "Aries Bach",
                            style = MaterialTheme.typography.titleMedium,
                            color = darkCharcoal,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Hockey Correspondent",
                            style = MaterialTheme.typography.labelSmall,
                            color = slateBlue
                        )
                    }
                }


                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp)
                ) {
                    Text(
                        text = "FEATURED ARTICLE",
                        style = MaterialTheme.typography.labelSmall,
                        color = deepTeal,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "May 19, 2025",
                        style = MaterialTheme.typography.labelSmall,
                        color = slateBlue
                    )
                }


                Text(
                    text = "The Rise of African Hockey: A New Era Begins",
                    style = MaterialTheme.typography.headlineLarge,
                    color = darkCharcoal,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 36.sp,
                    modifier = Modifier.padding(bottom = 16.dp)
                )


                Text(
                    text = " " ,
                    style = MaterialTheme.typography.bodyLarge,
                    color = darkCharcoal.copy(alpha = 0.9f),
                    lineHeight = 24.sp,
                    modifier = Modifier.padding(bottom = 24.dp)
                )

                // Key Stat Highlight
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = slateBlue.copy(alpha = 0.1f),
                    modifier = Modifier.padding(bottom = 24.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "300%",
                            style = MaterialTheme.typography.displaySmall,
                            color = deepTeal,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Text(
                            text = "Increase in youth hockey participation across Africa since 2020",
                            style = MaterialTheme.typography.bodyMedium,
                            color = darkCharcoal,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                // Continue Reading Section
                Text(
                    text = "Continue reading this article on our digital platform",
                    style = MaterialTheme.typography.labelMedium,
                    color = slateBlue,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Button(
                    onClick = { /* Open full article */ },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = deepTeal,
                        contentColor = Color.White
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("READ FULL ARTICLE")
                }
            }
        }
    }
}

